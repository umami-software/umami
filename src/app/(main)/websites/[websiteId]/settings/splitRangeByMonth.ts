import { addDays, addMonths, startOfDay, startOfMonth } from 'date-fns';

export interface MonthRange {
  startAt: number;
  endAt: number;
}

export function toDayRange(from: Date, to: Date): MonthRange {
  return {
    startAt: startOfDay(from).getTime(),
    endAt: startOfDay(addDays(to, 1)).getTime(),
  };
}

// Splits [startAt, endAt) into calendar months in the browser timezone.
export function splitRangeByMonth(startAt: number, endAt: number): MonthRange[] {
  const ranges: MonthRange[] = [];
  let cursor = startAt;

  while (cursor < endAt) {
    const next = Math.min(startOfMonth(addMonths(cursor, 1)).getTime(), endAt);

    ranges.push({ startAt: cursor, endAt: next });
    cursor = next;
  }

  return ranges;
}
