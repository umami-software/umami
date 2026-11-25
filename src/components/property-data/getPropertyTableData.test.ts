import { describe, expect, test } from 'vitest';
import { getPropertyTableData } from './getPropertyTableData';

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
