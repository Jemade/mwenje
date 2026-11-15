import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { AlertItem, Area, PowerStatus, seedAlerts, seedAreas } from './mock';

// Local-only store. When the backend exists, the reducer actions become API calls
// and the seed data comes from GET /areas and GET /alerts.

type State = {
  onboarded: boolean;
  areaId: string;
  headsUp: boolean;
  areas: Area[];
  alerts: AlertItem[];
};

type Action =
  | { type: 'hydrate'; state: State }
  | { type: 'onboard' }
  | { type: 'setArea'; id: string }
  | { type: 'toggleHeadsUp' }
  | { type: 'report'; id: string; status: PowerStatus }
  | { type: 'markAllRead' }
  | { type: 'markRead'; id: string }
  | { type: 'reset' };

const STORAGE_KEY = 'mwenje.state.v1';

function initial(): State {
  const now = Date.now();
  const areas = seedAreas(now);
  return { onboarded: false, areaId: 'avondale', headsUp: true, areas, alerts: seedAlerts(now, areas) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'onboard':
      return { ...state, onboarded: true };
    case 'setArea':
      return { ...state, areaId: action.id };
    case 'toggleHeadsUp':
      return { ...state, headsUp: !state.headsUp };
    case 'markAllRead':
      return { ...state, alerts: state.alerts.map((a) => ({ ...a, read: true })) };
    case 'markRead':
      return { ...state, alerts: state.alerts.map((a) => (a.id === action.id ? { ...a, read: true } : a)) };
    case 'reset':
      return initial();
    case 'report': {
      const now = Date.now();
      const area = state.areas.find((a) => a.id === action.id);
      if (!area) return state;
      const changed = area.status !== action.status;
      const updated: Area = changed
        ? { ...area, status: action.status, since: now, reporters: 1, recent: 1 }
        : { ...area, reporters: area.reporters + 1, recent: area.recent + 1 };
      const alert: AlertItem | null = changed
        ? {
            id: `r${now}`,
            kind: action.status === 'on' ? 'back' : 'off',
            title: action.status === 'on' ? 'Power is back' : 'Power went off',
            body: `${area.name} · reported by you`,
            at: now,
            read: true,
          }
        : null;
      return {
        ...state,
        areas: state.areas.map((a) => (a.id === area.id ? updated : a)),
        alerts: alert ? [alert, ...state.alerts] : state.alerts,
      };
    }
  }
}

type Store = State & {
  ready: boolean;
  area: Area;
  unread: number;
  dispatch: (a: Action) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'hydrate', state: { ...initial(), ...JSON.parse(raw) } });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<Store>(() => {
    const area = state.areas.find((a) => a.id === state.areaId) ?? state.areas[0];
    return { ...state, ready, area, unread: state.alerts.filter((a) => !a.read).length, dispatch };
  }, [state, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

/** Current time, refreshed every `ms` so timers on screen stay live. */
export function useNow(ms = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
