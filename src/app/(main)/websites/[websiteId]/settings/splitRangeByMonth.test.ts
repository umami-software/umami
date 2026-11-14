import { describe, expect, test } from 'vitest';
import { splitRangeByMonth, toDayRange } from './splitRangeByMonth';

const at = (year: number, month: number, day: number) => new Date(year, month, day).getTime();

describe('toDayRange', () => {
  test('covers whole days with an exclusive end', () => {
    expect(toDayRange(new Date(2026, 9, 3, 15, 30), new Date(2026, 9, 3, 9))).toEqual({
      startAt: at(2026, 9, 3),
      endAt: at(2026, 9, 4),
    });
  });
});

describe('splitRangeByMonth', () => {
  test('keeps a range inside one month as one batch', () => {
    expect(splitRangeByMonth(at(2026, 9, 3), at(2026, 9, 10))).toEqual([
      { startAt: at(2026, 9, 3), endAt: at(2026, 9, 10) },
    ]);
  });

  test('clips the first and last months', () => {
    expect(splitRangeByMonth(at(2026, 8, 15), at(2026, 10, 11))).toEqual([
      { startAt: at(2026, 8, 15), endAt: at(2026, 9, 1) },
      { startAt: at(2026, 9, 1), endAt: at(2026, 10, 1) },
      { startAt: at(2026, 10, 1), endAt: at(2026, 10, 11) },
    ]);
  });

  test('crosses a year boundary', () => {
    expect(splitRangeByMonth(at(2026, 11, 20), at(2027, 0, 6))).toEqual([
      { startAt: at(2026, 11, 20), endAt: at(2027, 0, 1) },
      { startAt: at(2027, 0, 1), endAt: at(2027, 0, 6) },
    ]);
  });

  test('returns no batch for an empty or inverted range', () => {
    expect(splitRangeByMonth(at(2026, 9, 3), at(2026, 9, 3))).toEqual([]);
    expect(splitRangeByMonth(at(2026, 9, 4), at(2026, 9, 3))).toEqual([]);
  });

  test('batches are contiguous and start at local midnight on the 1st, across DST changes', () => {
    const batches = splitRangeByMonth(at(2026, 0, 15), at(2027, 2, 15));

    expect(batches).toHaveLength(15);
    batches.slice(1).forEach((batch, index) => {
      const start = new Date(batch.startAt);

      expect(batch.startAt).toBe(batches[index].endAt);
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
    });
  });
});
