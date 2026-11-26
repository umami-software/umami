import { describe, expect, test } from 'vitest';
import { getOtherTotal, getPropertyTableData } from './getPropertyTableData';

const totals = [
  { value: 'youtube', total: 50 },
  { value: 'instagram', total: 30 },
  { value: 'appstore', total: 15 },
  { value: 'other', total: 5 },
];

describe('getPropertyTableData', () => {
  test('returns every row with its share of the total when there is no limit', () => {
    expect(getPropertyTableData(totals)).toEqual([
      { label: 'youtube', count: 50, percent: 50 },
      { label: 'instagram', count: 30, percent: 30 },
      { label: 'appstore', count: 15, percent: 15 },
      { label: 'other', count: 5, percent: 5 },
    ]);
  });

  test('takes percentages against all values before applying the limit', () => {
    expect(getPropertyTableData(totals, 2)).toEqual([
      { label: 'youtube', count: 50, percent: 50 },
      { label: 'instagram', count: 30, percent: 30 },
    ]);
  });

  test('does not spread the share evenly across a top 10 of many values', () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({ value: `v${index}`, total: 1 }));
    const rows = getPropertyTableData(many, 10);

    expect(rows).toHaveLength(10);
    expect(rows.every(({ percent }) => percent === 0.1)).toBe(true);
  });

  test('returns no rows when there is no data', () => {
    expect(getPropertyTableData([])).toEqual([]);
    expect(getPropertyTableData([{ value: 'a', total: 0 }])).toEqual([]);
  });
});

// anicet-bart's case on #4803: 130 distinct values over 150 events, the top value has 21 events.
// The server returns only the top 100 values (21 + 99 x 1 = 120 events) plus the grand total.
const truncated = [
  { value: 'top', total: 21 },
  ...Array.from({ length: 99 }, (_, index) => ({ value: `v${index}`, total: 1 })),
];

describe('getPropertyTableData with a grand total', () => {
  test('takes percentages against the grand total, not the returned rows', () => {
    const [top] = getPropertyTableData(truncated, 10, 150);

    expect(top.count).toBe(21);
    expect(Math.round(top.percent)).toBe(14);
  });

  test('falls back to the sum of the rows when the grand total is missing', () => {
    const [top] = getPropertyTableData(truncated, 10);

    expect(top.percent).toBe(17.5);
    expect(getPropertyTableData(totals, 2, undefined)).toEqual(getPropertyTableData(totals, 2));
  });
});

describe('getOtherTotal', () => {
  test('includes the values the server left out past its limit', () => {
    // 150 events, of which the top 10 rows hold 21 + 9 x 1 = 30.
    expect(getOtherTotal(truncated, 10, 150)).toBe(120);
  });

  test('is zero when nothing is left out', () => {
    expect(getOtherTotal(totals, 10, 100)).toBe(0);
    expect(getOtherTotal(totals, 4)).toBe(0);
  });

  test('covers only the rows past the limit when the grand total is missing', () => {
    expect(getOtherTotal(totals, 2)).toBe(20);
  });
});
