import { describe, expect, test } from 'vitest';
import { formatPercent } from './format';

describe('formatPercent', () => {
  // Rounding would show 0.4% as 0%, which reads the same as never converting.
  test('keeps one decimal below 1% so "converts a little" differs from "never converts"', () => {
    expect(formatPercent(63 / 8020)).toBe('0.8%');
    expect(formatPercent(40 / 10000)).toBe('0.4%');
    expect(formatPercent(82 / 16000)).toBe('0.5%');
  });

  // From 1% up, a decimal changes no comparison and implies precision small samples lack.
  test('uses whole numbers from 1%', () => {
    expect(formatPercent(0.0098)).toBe('1%');
    expect(formatPercent(0.063)).toBe('6%');
    expect(formatPercent(0.083)).toBe('8%');
    expect(formatPercent(0.333)).toBe('33%');
    expect(formatPercent(1)).toBe('100%');
  });

  // Steps after an empty step divide by zero.
  test('shows 0% when there is nothing to divide by', () => {
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(Number.NaN)).toBe('0%');
    expect(formatPercent(Number.POSITIVE_INFINITY)).toBe('0%');
  });
});
