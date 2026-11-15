// Mock data that stands in for the backend. Shapes match what the API will return.

export type PowerStatus = 'on' | 'off';

export type Area = {
  id: string;
  name: string;
  city: string;
  status: PowerStatus;
  /** When the current status started (ms since epoch) */
  since: number;
  /** Total reports for the current status */
  reporters: number;
  /** Reports in the last 10 minutes */
  recent: number;
  /** Typical outage length in minutes for this suburb */
  usualCutMin: number;
  /** Position on the map, in the 390×844 design frame. Omitted = off-map. */
  pos?: { x: number; y: number };
  /** Hour offset applied to the forecast pattern */
  shift: number;
};

export type AlertKind = 'back' | 'likely' | 'off';

export type AlertItem = {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
};

export type MapLabel = { text: string; x: number; y: number };

const MIN = 60_000;
const HOUR = 60 * MIN;

export function seedAreas(now: number): Area[] {
  return [
    { id: 'avondale', name: 'Avondale', city: 'Harare', status: 'off', since: now - (2 * HOUR + 18 * MIN), reporters: 48, recent: 12, usualCutMin: 223, pos: { x: 206, y: 300 }, shift: 0 },
    { id: 'marlborough', name: 'Marlborough', city: 'Harare', status: 'on', since: now - 5 * HOUR, reporters: 19, recent: 3, usualCutMin: 240, pos: { x: 80, y: 160 }, shift: 1 },
    { id: 'borrowdale', name: 'Borrowdale', city: 'Harare', status: 'on', since: now - 26 * MIN, reporters: 27, recent: 9, usualCutMin: 200, pos: { x: 330, y: 200 }, shift: 2 },
    { id: 'mabelreign', name: 'Mabelreign', city: 'Harare', status: 'off', since: now - (1 * HOUR + 4 * MIN), reporters: 31, recent: 6, usualCutMin: 260, pos: { x: 64, y: 300 }, shift: 1 },
    { id: 'cbd', name: 'CBD', city: 'Harare', status: 'on', since: now - 9 * HOUR, reporters: 64, recent: 14, usualCutMin: 120, pos: { x: 220, y: 430 }, shift: 3 },
    { id: 'belvedere', name: 'Belvedere', city: 'Harare', status: 'off', since: now - (3 * HOUR + 40 * MIN), reporters: 22, recent: 4, usualCutMin: 300, pos: { x: 92, y: 490 }, shift: 2 },
    { id: 'eastlea', name: 'Eastlea', city: 'Harare', status: 'off', since: now - 47 * MIN, reporters: 17, recent: 5, usualCutMin: 210, pos: { x: 340, y: 440 }, shift: 0 },
    { id: 'highfield', name: 'Highfield', city: 'Harare', status: 'on', since: now - (6 * HOUR + 5 * MIN), reporters: 56, recent: 2, usualCutMin: 370, shift: 1 },
    { id: 'hillside', name: 'Hillside', city: 'Bulawayo', status: 'on', since: now - 3 * HOUR, reporters: 11, recent: 1, usualCutMin: 180, shift: 2 },
  ];
}

export const mapLabels: MapLabel[] = [
  { text: 'Marlborough', x: 26, y: 186 },
  { text: 'Borrowdale', x: 286, y: 236 },
  { text: 'Mabelreign', x: 24, y: 330 },
  { text: 'CBD', x: 200, y: 452 },
  { text: 'Belvedere', x: 44, y: 520 },
];

export function seedAlerts(now: number, areas: Area[]): AlertItem[] {
  const home = areas[0];
  return [
    { id: 'a1', kind: 'likely', title: 'Cut likely at 05:00', body: 'Charge phones and power banks tonight', at: now - 12 * MIN, read: false },
    { id: 'a2', kind: 'off', title: 'Power went off', body: `${home.name} · first reports on 2nd St`, at: home.since, read: false },
    { id: 'a3', kind: 'back', title: 'Power is back', body: 'Highfield (Mum) · after 6h 10m', at: now - (6 * HOUR + 5 * MIN), read: true },
    { id: 'a4', kind: 'back', title: 'Power is back', body: `${home.name} · 23 neighbours confirmed`, at: now - (9 * HOUR + 30 * MIN), read: true },
  ];
}

// ---- Forecast -------------------------------------------------------------

export type Cut = { start: number; end: number; prob: number; note: string };
export type ForecastDay = { date: Date; cut: Cut | null };

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** A 7-day forecast from today. Pattern: cuts on day +1, +3, +5, shifted per suburb. */
export function forecastFor(area: Area, today: Date): ForecastDay[] {
  const pattern: Record<number, Omit<Cut, 'note'> & { note?: string }> = {
    1: { start: 5, end: 10.5, prob: 0.78, note: 'Morning pattern' },
    3: { start: 4, end: 9, prob: 0.71 },
    5: { start: 17, end: 22, prob: 0.64, note: 'Evening peak pattern' },
  };
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const p = pattern[i];
    if (!p) return { date, cut: null };
    const shift = area.shift * 0.5;
    return {
      date,
      cut: {
        start: p.start + shift,
        end: p.end + shift,
        prob: Math.max(0.4, p.prob - area.shift * 0.03),
        note: p.note ?? `Seen 5 of the last 6 ${WEEKDAYS[date.getDay()]}s`,
      },
    };
  });
}

/** Chance (0–1) that power is ON at a given hour of the day. */
export function chanceOfPower(cut: Cut | null, hour: number): number {
  const high = 0.86;
  const smooth = (edge0: number, edge1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };
  // a small evening dip every day, so the curve looks like real history
  const evening = 0.18 * smooth(16.5, 18, hour) * (1 - smooth(18.5, 20, hour));
  if (!cut) return high - evening * 0.6;
  const low = Math.max(0.05, 1 - cut.prob - 0.04);
  const inWindow = smooth(cut.start - 1.6, cut.start + 1.4, hour) * (1 - smooth(cut.end - 2.2, cut.end + 1, hour));
  return Math.max(0.03, high - (high - low) * inWindow - evening * (1 - inWindow));
}
