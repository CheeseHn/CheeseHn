export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const WEEKDAY_NAMES_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const WEEKDAY_NAMES_LONG = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

/** Formats a Date as YYYY-MM-DD using local time (avoids UTC off-by-one bugs). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses a YYYY-MM-DD string into a local Date at midnight. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, amount: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + amount);
  return toDateKey(d);
}

export function addMonths(key: string, amount: number): string {
  const d = parseDateKey(key);
  d.setMonth(d.getMonth() + amount);
  return toDateKey(d);
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-first weekday index (0 = Monday .. 6 = Sunday). */
function mondayFirstIndex(jsWeekday: number): number {
  return (jsWeekday + 6) % 7;
}

/**
 * Builds a 6x7 matrix of date keys covering the given month plus the
 * leading/trailing days needed to fill full weeks (Monday-first).
 */
export function getMonthMatrix(year: number, month: number): string[][] {
  const first = startOfMonth(year, month);
  const leading = mondayFirstIndex(first.getDay());
  const gridStart = new Date(year, month, 1 - leading);

  const weeks: string[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function isSameMonth(key: string, year: number, month: number): boolean {
  const d = parseDateKey(key);
  return d.getFullYear() === year && d.getMonth() === month;
}

/** Returns the 7 date keys (Monday-first) of the week containing `dateKey`. */
export function getWeekDates(dateKey: string): string[] {
  const d = parseDateKey(dateKey);
  const monday = new Date(d);
  monday.setDate(d.getDate() - mondayFirstIndex(d.getDay()));
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(toDateKey(monday));
    monday.setDate(monday.getDate() + 1);
  }
  return days;
}

/** Friendly label for a Monday-first week, e.g. "13–19 de julio de 2026". */
export function formatWeekRangeLabel(weekDates: string[]): string {
  const start = parseDateKey(weekDates[0]);
  const end = parseDateKey(weekDates[6]);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} de ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)}`;
  const endLabel = sameYear
    ? `${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`
    : `${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
  return `${startLabel} – ${endLabel}`;
}

export function formatFriendlyDate(key: string): string {
  const d = parseDateKey(key);
  const weekday = WEEKDAY_NAMES_LONG[mondayFirstIndex(d.getDay())];
  return `${weekday} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function formatShortDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export function daysBetween(fromKey: string, toKey: string): number {
  const a = parseDateKey(fromKey);
  const b = parseDateKey(toKey);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
