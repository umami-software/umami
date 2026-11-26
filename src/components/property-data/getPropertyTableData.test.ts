import { describe, expect, test } from 'vitest';
import { getOtherTotal, getPropertyTableData, type PropertyTotal } from './getPropertyTableData';

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

// Edge cases for the grand total: every case below also checks that Other is never negative and
// that the shown counts plus Other add up to the denominator the percentages use.
const rows = (...totals: number[]): PropertyTotal[] =>
  totals.map((total, i) => ({ value: `v${i}`, total }));

// Mirrors BoardEventProperties: totals and grandTotal are converted with Number(), and a
// falsy grandTotal becomes undefined.
const fromApi = (data: { value: any; total: any; grandTotal?: any }[]) => ({
  totals: data.map(({ value, total }) => ({ value: String(value), total: Number(total) })),
  grandTotal: data.length ? Number(data[0].grandTotal) || undefined : undefined,
});

// Invariants: shown counts + Other === effective denominator, and each row's percent is
// count / (shown + Other) * 100.
function checkInvariants(totals: PropertyTotal[], limit: number, grandTotal?: number) {
  const table = getPropertyTableData(totals, limit, grandTotal);
  const other = getOtherTotal(totals, limit, grandTotal);
  const rowsSum = totals.reduce((a, { total }) => a + total, 0);
  const denominator = grandTotal && grandTotal >= rowsSum ? grandTotal : rowsSum;
  const shown = totals.slice(0, limit).reduce((a, { total }) => a + total, 0);

  expect(other).toBeGreaterThanOrEqual(0);
  expect(shown + other).toBe(denominator);
  if (denominator > 0) {
    expect(table.reduce((a, { count }) => a + count, 0)).toBe(shown);
  }
  for (const row of table) {
    expect(row.percent).toBeCloseTo((row.count / (shown + other)) * 100, 10);
  }
  return { table, other };
}

describe('empty data', () => {
  test('no rows, no grandTotal', () => {
    expect(getPropertyTableData([], 10)).toEqual([]);
    expect(getOtherTotal([], 10)).toBe(0);
  });

  test('no rows but a grandTotal: table empty, Other holds the grandTotal', () => {
    expect(getPropertyTableData([], 10, 50)).toEqual([]);
    expect(getOtherTotal([], 10, 50)).toBe(50);
  });

  test('component path with empty API data', () => {
    const { totals, grandTotal } = fromApi([]);
    expect(grandTotal).toBeUndefined();
    expect(getPropertyTableData(totals, 10, grandTotal)).toEqual([]);
    expect(getOtherTotal(totals, 10, grandTotal)).toBe(0);
  });

  test('rows that all total 0 produce no table and no Other', () => {
    expect(getPropertyTableData(rows(0, 0), 10, 0)).toEqual([]);
    expect(getOtherTotal(rows(0, 0), 10, 0)).toBe(0);
  });
});

describe('grandTotal = 0', () => {
  test('falls back to the sum of rows', () => {
    const totals = rows(3, 1);
    const { table, other } = checkInvariants(totals, 10, 0);
    expect(table).toEqual([
      { label: 'v0', count: 3, percent: 75 },
      { label: 'v1', count: 1, percent: 25 },
    ]);
    expect(other).toBe(0);
  });
});

describe('grandTotal missing', () => {
  test('undefined falls back to the sum of rows', () => {
    const { table, other } = checkInvariants(rows(6, 2, 2), 2, undefined);
    expect(table).toEqual([
      { label: 'v0', count: 6, percent: 60 },
      { label: 'v1', count: 2, percent: 20 },
    ]);
    expect(other).toBe(2);
  });

  test('NaN falls back to the sum of rows', () => {
    const { table, other } = checkInvariants(rows(6, 2, 2), 2, NaN);
    expect(table.map(r => r.percent)).toEqual([60, 20]);
    expect(other).toBe(2);
  });

  test('component path: missing grandTotal field becomes undefined', () => {
    const { totals, grandTotal } = fromApi([
      { value: 'a', total: '1' },
      { value: 'b', total: '1' },
    ]);
    expect(grandTotal).toBeUndefined();
    expect(getPropertyTableData(totals, 10, grandTotal).map(r => r.percent)).toEqual([50, 50]);
  });
});

describe('grandTotal smaller than sum of rows', () => {
  test('falls back to the sum of rows and Other is never negative', () => {
    const totals = rows(5, 3, 2);
    const { table, other } = checkInvariants(totals, 1, 4);
    expect(table).toEqual([{ label: 'v0', count: 5, percent: 50 }]);
    expect(other).toBe(5);
  });

  test('with all rows shown, Other is exactly 0', () => {
    const { other } = checkInvariants(rows(5, 3, 2), 3, 1);
    expect(other).toBe(0);
  });
});

describe('limit larger than number of rows', () => {
  test('returns all rows, Other is only what the server left out', () => {
    const { table, other } = checkInvariants(rows(4, 4), 10, 10);
    expect(table).toEqual([
      { label: 'v0', count: 4, percent: 40 },
      { label: 'v1', count: 4, percent: 40 },
    ]);
    expect(other).toBe(2);
  });

  test('without grandTotal, Other is 0', () => {
    const { table, other } = checkInvariants(rows(4, 4), 10);
    expect(table).toHaveLength(2);
    expect(other).toBe(0);
  });
});

describe('exactly 100 rows (server limit hit)', () => {
  const hundred = rows(...Array(100).fill(2));

  test('grandTotal equal to the sum: no Other beyond the hidden rows', () => {
    const { table, other } = checkInvariants(hundred, 100, 200);
    expect(table).toHaveLength(100);
    expect(table[0].percent).toBe(1);
    expect(other).toBe(0);
  });

  test('grandTotal equal to the sum, limit 10: Other = remaining 90 rows', () => {
    const { table, other } = checkInvariants(hundred, 10, 200);
    expect(table).toHaveLength(10);
    expect(other).toBe(180);
  });

  test('grandTotal larger than the sum: Other includes values past the limit', () => {
    const { table, other } = checkInvariants(hundred, 100, 250);
    expect(table[0].percent).toBeCloseTo(0.8, 10);
    expect(other).toBe(50);
    expect(getOtherTotal(hundred, 10, 250)).toBe(230);
  });
});

describe('string totals from the API', () => {
  const api = [
    { value: 'a', total: '3', grandTotal: '10' },
    { value: 'b', total: '2', grandTotal: '10' },
  ];

  test('realistic path: Number() conversion as in the component', () => {
    const { totals, grandTotal } = fromApi(api);
    expect(grandTotal).toBe(10);
    const { table, other } = checkInvariants(totals, 1, grandTotal);
    expect(table).toEqual([{ label: 'a', count: 3, percent: 30 }]);
    expect(other).toBe(7);
  });

  test('realistic path: grandTotal "0" becomes undefined and falls back', () => {
    const { totals, grandTotal } = fromApi([{ value: 'a', total: '4', grandTotal: '0' }]);
    expect(grandTotal).toBeUndefined();
    expect(getPropertyTableData(totals, 10, grandTotal)[0].percent).toBe(100);
  });
});

describe('array property', () => {
  // 3 events tagged ["a","b"]: each element counted, grandTotal 6.
  const totals: PropertyTotal[] = [
    { value: 'a', total: 3 },
    { value: 'b', total: 3 },
  ];

  test.each([2, 10])('each value 50%%, no Other with limit %i', limit => {
    const { table, other } = checkInvariants(totals, limit, 6);
    expect(table).toEqual([
      { label: 'a', count: 3, percent: 50 },
      { label: 'b', count: 3, percent: 50 },
    ]);
    expect(other).toBe(0);
  });

  test('limit 1: Other = 3', () => {
    const { other } = checkInvariants(totals, 1, 6);
    expect(other).toBe(3);
  });
});

describe('invariants across mixed cases', () => {
  const cases: [string, PropertyTotal[], number, number | undefined][] = [
    ['single row', rows(7), 1, 7],
    ['single row with hidden values', rows(7), 1, 20],
    ['uneven rows no grandTotal', rows(9, 5, 3, 1), 2, undefined],
    ['uneven rows NaN', rows(9, 5, 3, 1), 3, NaN],
    ['grandTotal below sum', rows(9, 5, 3, 1), 2, 10],
    ['large numbers', rows(1e9, 5e8, 1), 2, 2e9],
  ];

  test.each(cases)('%s', (_name, totals, limit, grandTotal) => {
    checkInvariants(totals, limit, grandTotal);
  });
});
