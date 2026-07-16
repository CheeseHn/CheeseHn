import type { CalendarEvent, Occurrence } from '../types';
import { addDays, daysBetween, daysInMonth, parseDateKey } from './date';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Whether `event` has an occurrence that lands exactly on `dateKey`. */
export function matchesOccurrence(event: CalendarEvent, dateKey: string): boolean {
  if (dateKey < event.date) return false;

  if (event.recurrence === 'none') {
    return dateKey === event.date;
  }

  const anchor = parseDateKey(event.date);
  const d = parseDateKey(dateKey);

  if (event.recurrence === 'weekly') {
    return daysBetween(event.date, dateKey) % 7 === 0;
  }

  if (event.recurrence === 'monthly') {
    const targetDay = anchor.getDate();
    const lastDayOfThisMonth = daysInMonth(d.getFullYear(), d.getMonth());
    const effectiveDay = Math.min(targetDay, lastDayOfThisMonth);
    return d.getDate() === effectiveDay;
  }

  // yearly
  const targetMonth = anchor.getMonth();
  let targetDay = anchor.getDate();
  if (targetMonth === 1 && targetDay === 29 && !isLeapYear(d.getFullYear())) {
    targetDay = 28;
  }
  return d.getMonth() === targetMonth && d.getDate() === targetDay;
}

/** Expands events into concrete day occurrences for every day in [startKey, endKey]. */
export function getOccurrencesInRange(
  events: CalendarEvent[],
  startKey: string,
  endKey: string
): Occurrence[] {
  const result: Occurrence[] = [];
  let cursor = startKey;
  let guard = 0;
  while (cursor <= endKey && guard < 400) {
    for (const event of events) {
      if (matchesOccurrence(event, cursor)) {
        result.push({ event, date: cursor });
      }
    }
    cursor = addDays(cursor, 1);
    guard++;
  }
  return result;
}

/** Groups occurrences by date key for quick lookup while rendering the grid. */
export function groupOccurrencesByDate(occurrences: Occurrence[]): Map<string, Occurrence[]> {
  const map = new Map<string, Occurrence[]>();
  for (const occ of occurrences) {
    const list = map.get(occ.date);
    if (list) {
      list.push(occ);
    } else {
      map.set(occ.date, [occ]);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.event.time ?? '99:99').localeCompare(b.event.time ?? '99:99'));
  }
  return map;
}

/** Next upcoming occurrence of a yearly event from `fromKey` (inclusive), searching up to 2 years ahead. */
export function nextYearlyOccurrence(event: CalendarEvent, fromKey: string): string | null {
  let cursor = fromKey;
  const limit = addDays(fromKey, 730);
  while (cursor <= limit) {
    if (matchesOccurrence(event, cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return null;
}
