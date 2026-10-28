import { describe, expect, test } from 'vitest';
import {
  getCountItems,
  getDisplayDates,
  getOlderThanCutoff,
  getOlderThanRange,
  getProgressPercent,
  getRunView,
  isEmptyCounts,
  MAX_OLDER_THAN_AMOUNT,
  parseOlderThanAmount,
  updatePeriod,
} from './clearDataHelpers';
import { EMPTY_COUNTS } from './useBatchedClear';

const at = (year: number, month: number, day: number, hours = 0) =>
  new Date(year, month, day, hours).getTime();

describe('parseOlderThanAmount', () => {
  test('accepts whole numbers of at least 1', () => {
    expect(parseOlderThanAmount('6')).toBe(6);
    expect(parseOlderThanAmount(' 12 ')).toBe(12);
    expect(parseOlderThanAmount('1')).toBe(1);
  });

  test('rejects empty, zero, negative, fractional and non-numeric amounts', () => {
    for (const value of ['', '0', '-3', '1.5', 'abc', '6e', '1e3']) {
      expect(parseOlderThanAmount(value)).toBeUndefined();
    }
  });

  test('rejects amounts above the maximum', () => {
    expect(parseOlderThanAmount(String(MAX_OLDER_THAN_AMOUNT))).toBe(MAX_OLDER_THAN_AMOUNT);
    expect(parseOlderThanAmount(String(MAX_OLDER_THAN_AMOUNT + 1))).toBeUndefined();
  });
});

describe('getOlderThanCutoff', () => {
  const now = new Date(2026, 9, 23, 15, 30);

  test('is the start of the day N units ago', () => {
    expect(getOlderThanCutoff(10, 'days', now).getTime()).toBe(at(2026, 9, 13));
    expect(getOlderThanCutoff(2, 'weeks', now).getTime()).toBe(at(2026, 9, 9));
    expect(getOlderThanCutoff(6, 'months', now).getTime()).toBe(at(2026, 3, 23));
    expect(getOlderThanCutoff(2, 'years', now).getTime()).toBe(at(2024, 9, 23));
  });

  test('clamps to the end of shorter months', () => {
    expect(getOlderThanCutoff(6, 'months', new Date(2026, 7, 31, 10)).getTime()).toBe(
      at(2026, 1, 28),
    );
  });

  test('clamps Feb 29 to Feb 28 in years', () => {
    expect(getOlderThanCutoff(1, 'years', new Date(2028, 1, 29, 10)).getTime()).toBe(
      at(2027, 1, 28),
    );
  });

  test('crosses month boundaries in days and weeks', () => {
    expect(getOlderThanCutoff(1, 'weeks', new Date(2026, 2, 3, 9)).getTime()).toBe(at(2026, 1, 24));
  });
});

describe('getOlderThanRange', () => {
  const now = new Date(2026, 9, 23, 15, 30);

  test('runs from the start of the first data month to the cutoff', () => {
    expect(getOlderThanRange(6, 'months', new Date(2025, 10, 12, 8), now)).toEqual({
      startAt: at(2025, 10, 1),
      endAt: at(2026, 3, 23),
    });
  });

  test('uses the selected unit for the cutoff', () => {
    expect(getOlderThanRange(30, 'days', new Date(2025, 10, 12), now)).toEqual({
      startAt: at(2025, 10, 1),
      endAt: at(2026, 8, 23),
    });
    expect(getOlderThanRange(1, 'years', new Date(2025, 10, 12), now)).toBeUndefined();
  });

  test('is undefined for invalid amounts', () => {
    for (const amount of [undefined, 0, -1, 1.5, Number.NaN, MAX_OLDER_THAN_AMOUNT + 1]) {
      expect(getOlderThanRange(amount, 'months', new Date(2020, 0, 1), now)).toBeUndefined();
    }
  });

  test('is undefined without a first data date', () => {
    expect(getOlderThanRange(6, 'months', null, now)).toBeUndefined();
    expect(getOlderThanRange(6, 'months', undefined, now)).toBeUndefined();
  });

  test('is undefined when all data is newer than the cutoff', () => {
    expect(getOlderThanRange(6, 'months', new Date(2026, 5, 1), now)).toBeUndefined();
  });

  test('is undefined when the first data month starts on the cutoff', () => {
    expect(
      getOlderThanRange(6, 'months', new Date(2026, 3, 1), new Date(2026, 9, 1, 12)),
    ).toBeUndefined();
  });

  test('keeps a range that starts in the cutoff month but before the cutoff day', () => {
    expect(getOlderThanRange(6, 'months', new Date(2026, 3, 30), now)).toEqual({
      startAt: at(2026, 3, 1),
      endAt: at(2026, 3, 23),
    });
  });
});

describe('getCountItems', () => {
  test('lists non-zero counts in display order', () => {
    expect(
      getCountItems({ events: 3, eventData: 0, sessions: 2, revenue: 0, replays: 1, heatmaps: 4 }),
    ).toEqual([
      { key: 'events', value: 3 },
      { key: 'sessions', value: 2 },
      { key: 'replays', value: 1 },
      { key: 'heatmaps', value: 4 },
    ]);
  });

  test('is empty when every count is zero', () => {
    expect(getCountItems(EMPTY_COUNTS)).toEqual([]);
  });
});

describe('isEmptyCounts', () => {
  test('is true only when every count is zero', () => {
    expect(isEmptyCounts(EMPTY_COUNTS)).toBe(true);
    expect(isEmptyCounts({ ...EMPTY_COUNTS, revenue: 1 })).toBe(false);
  });
});

describe('getDisplayDates', () => {
  test('shows the last included millisecond as the end date', () => {
    const { startDate, endDate } = getDisplayDates({
      startAt: at(2026, 8, 15),
      endAt: at(2026, 9, 4),
    });

    expect(startDate).toEqual(new Date(2026, 8, 15));
    expect(endDate).toEqual(new Date(at(2026, 9, 4) - 1));
    expect(endDate.getDate()).toBe(3);
  });
});

describe('getProgressPercent', () => {
  test('is the completed share of the total', () => {
    expect(getProgressPercent(0, 4)).toBe(0);
    expect(getProgressPercent(1, 4)).toBe(25);
    expect(getProgressPercent(4, 4)).toBe(100);
  });

  test('is zero when there is nothing to do', () => {
    expect(getProgressPercent(0, 0)).toBe(0);
  });
});

describe('getRunView', () => {
  test('shows progress and stop while running', () => {
    expect(getRunView('running')).toEqual({
      kind: 'progress',
      canStop: true,
      isStopping: false,
      canRetry: false,
      canClose: false,
    });
  });

  test('disables stop while stopping', () => {
    expect(getRunView('stopping')).toMatchObject({
      kind: 'progress',
      canStop: true,
      isStopping: true,
    });
  });

  test('treats idle as progress without actions', () => {
    expect(getRunView('idle')).toMatchObject({ kind: 'progress', canStop: false, canClose: false });
  });

  test('offers retry and close on error', () => {
    expect(getRunView('error')).toEqual({
      kind: 'error',
      canStop: false,
      isStopping: false,
      canRetry: true,
      canClose: true,
    });
  });

  test('only offers close when stopped or done', () => {
    for (const status of ['stopped', 'done'] as const) {
      expect(getRunView(status)).toEqual({
        kind: status,
        canStop: false,
        isStopping: false,
        canRetry: false,
        canClose: true,
      });
    }
  });
});

describe('updatePeriod', () => {
  const period = { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) };

  test('moves the end forward when the start passes it', () => {
    expect(updatePeriod(period, 'from', new Date(2026, 8, 25))).toEqual({
      from: new Date(2026, 8, 25),
      to: new Date(2026, 8, 25),
    });
  });

  test('moves the start back when the end goes before it', () => {
    expect(updatePeriod(period, 'to', new Date(2026, 8, 5))).toEqual({
      from: new Date(2026, 8, 5),
      to: new Date(2026, 8, 5),
    });
  });

  test('keeps the other date when the order is valid', () => {
    expect(updatePeriod(period, 'from', new Date(2026, 8, 12))).toEqual({
      from: new Date(2026, 8, 12),
      to: period.to,
    });
  });
});
