const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez",
];

export function toDateOnlyUTC(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function todayDateOnlyUTC(): Date {
  return toDateOnlyUTC(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function getMondayOfWeek(date: Date): Date {
  const dateOnly = toDateOnlyUTC(date);
  const weekday = dateOnly.getUTCDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  return addDays(dateOnly, diffToMonday);
}

export function getWeekDays(monday: Date, count = 5): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(monday, i));
}

export function isSameDate(a: Date, b: Date): boolean {
  return toDateOnlyUTC(a).getTime() === toDateOnlyUTC(b).getTime();
}

export function formatShortDate(date: Date): string {
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatWeekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getUTCDay()];
}

export function formatFullDate(date: Date): string {
  return `${WEEKDAY_LABELS[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, "0")} de ${MONTH_LABELS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}

export function formatWeekRangeLabel(monday: Date): string {
  const friday = addDays(monday, 4);
  const sameMonth = monday.getUTCMonth() === friday.getUTCMonth();
  const start = `${String(monday.getUTCDate()).padStart(2, "0")}`;
  const end = sameMonth
    ? `${String(friday.getUTCDate()).padStart(2, "0")} de ${MONTH_LABELS[friday.getUTCMonth()]}`
    : `${String(friday.getUTCDate()).padStart(2, "0")} de ${MONTH_LABELS[friday.getUTCMonth()]}`;
  const startLabel = sameMonth ? start : `${start} de ${MONTH_LABELS[monday.getUTCMonth()]}`;
  return `${startLabel} – ${end} de ${friday.getUTCFullYear()}`;
}

export function dateToInputValue(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function inputValueToDateOnlyUTC(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
