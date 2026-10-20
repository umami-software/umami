import { afterEach, describe, expect, test } from 'vitest';
import { getChartBucketIndex, renderNumberLabels } from './charts';

// test for renderNumberLabels

describe('renderNumberLabels', () => {
  test.each([
    ['1000000', '1.0m'],
    ['2500000', '2.5m'],
  ])("formats numbers ≥ 1 million as 'Xm' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([['150000', '150k']])("formats numbers ≥ 100K as 'Xk' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([
    ['12500', '12.5k'],
  ])("formats numbers ≥ 10K as 'X.Xk' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([['1500', '1.50k']])("formats numbers ≥ 1K as 'X.XXk' (%s → %s)", (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([
    ['999', '999'],
  ])('calls formatNumber for values < 1000 (%s → %s)', (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });

  test.each([
    ['0', '0'],
    ['-5000', '-5000'],
  ])('handles edge cases correctly (%s → %s)', (input, expected) => {
    expect(renderNumberLabels(input)).toBe(expected);
  });
});

describe('getChartBucketIndex', () => {
  test('places an annotation in its monthly data bucket', () => {
    const data = [{ x: '2026-08' }, { x: '2026-09' }];

    expect(getChartBucketIndex(data, new Date('2026-08-27T07:00:00.000Z'))).toBe(0);
  });

  test('accepts raw timestamps', () => {
    expect(getChartBucketIndex([0, 10, 20], new Date(15))).toBe(1);
  });

  describe('in the browser timezone', () => {
    const tz = process.env.TZ;

    afterEach(() => {
      if (tz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = tz;
      }
    });

    test.each(['Asia/Seoul', 'Europe/Copenhagen', 'UTC', 'America/Los_Angeles'])(
      'matches local day and month labels in %s',
      timezone => {
        process.env.TZ = timezone;

        const days = [{ x: '2026-09-04' }, { x: '2026-09-05' }, { x: '2026-09-06' }];
        const months = [{ x: '2026-08' }, { x: '2026-09' }];

        expect(getChartBucketIndex(days, new Date(2026, 8, 3))).toBe(-1);
        expect(getChartBucketIndex(days, new Date(2026, 8, 5))).toBe(1);
        expect(getChartBucketIndex(days, new Date(2026, 8, 5, 23, 59))).toBe(1);
        expect(getChartBucketIndex(months, new Date(2026, 8, 1))).toBe(1);
      },
    );
  });
});
