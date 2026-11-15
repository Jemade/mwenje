const pad = (n: number) => String(n).padStart(2, '0');

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const clock = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Decimal hour (e.g. 10.5) → "10:30" */
export const hourLabel = (h: number) => {
  const total = Math.round(h * 60);
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
};

/** Elapsed ms → "2:18" */
export const hm = (ms: number) => {
  const m = Math.max(0, Math.floor(ms / 60_000));
  return `${Math.floor(m / 60)}:${pad(m % 60)}`;
};

/** Elapsed ms → "2h 18m" */
export const hmWords = (ms: number) => {
  const m = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${pad(m % 60)}m` : `${m}m`;
};

export const ago = (ms: number, now: number) => {
  const m = Math.floor((now - ms) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  return `${Math.floor(m / 60)} h ago`;
};

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const weekday = (d: Date) => WD[d.getDay()];
export const monthName = (d: Date) => MONTHS[d.getMonth()];

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const dayWord = (d: Date, today: Date) => {
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${weekday(d)} ${d.getDate()}`;
};
