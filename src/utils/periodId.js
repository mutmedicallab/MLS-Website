// utils/periodId.js — one shared helper for both games
export function getCurrentPeriodId(periodDays = 2) {
  const epoch = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const periodMs = periodDays * 24 * 60 * 60 * 1000;
  const periodNumber = Math.floor((now - epoch) / periodMs);
  return `period-${periodNumber}`;
}