export interface IsoWeekWindow {
  id: string;
  start: string;
  end: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getIsoWeekWindow(date = new Date()): IsoWeekWindow {
  const current = toUtcDate(date);
  const day = current.getUTCDay() || 7;
  const monday = new Date(current.getTime() - (day - 1) * DAY_MS);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  const isoYear = thursday.getUTCFullYear();
  const firstThursday = toUtcDate(new Date(Date.UTC(isoYear, 0, 4)));
  const firstDay = firstThursday.getUTCDay() || 7;
  const firstMonday = new Date(firstThursday.getTime() - (firstDay - 1) * DAY_MS);
  const week = Math.floor((monday.getTime() - firstMonday.getTime()) / (7 * DAY_MS)) + 1;

  return {
    id: `${isoYear}-W${String(week).padStart(2, "0")}`,
    start: formatDate(monday),
    end: formatDate(sunday),
  };
}
