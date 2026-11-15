import { Area, Cut, forecastFor } from './mock';

/** The next forecast cut that has not finished yet. */
export function nextCut(area: Area, now: number): { date: Date; cut: Cut } | null {
  const today = new Date(now);
  const hour = today.getHours() + today.getMinutes() / 60;
  for (const [i, d] of forecastFor(area, today).entries()) {
    if (d.cut && (i > 0 || d.cut.end > hour)) return { date: d.date, cut: d.cut };
  }
  return null;
}
