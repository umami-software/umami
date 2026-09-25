import { renderHook } from '@testing-library/react';
import { toZonedTime } from 'date-fns-tz';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/components/hooks/useNavigation', () => ({
  useNavigation: () => ({ query: { date: '0day', compare: 'prev' } }),
}));

vi.mock('@/components/hooks/useLocale', () => ({
  useLocale: () => ({ locale: 'en-US' }),
}));

import { useDateRange } from './useDateRange';

const NOW = new Date('2026-07-24T19:07:30');
const HOUR = 60 * 60 * 1000;

function comparedLength({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
  return Number(endDate) - Number(startDate) + 1;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDateRange dateCompare', () => {
  test('compares only the elapsed whole hours of the previous period', () => {
    const { result } = renderHook(() => useDateRange());

    // Today at 19:07 compares yesterday 00:00 to 18:59:59.999.
    expect(comparedLength(result.current.dateCompare)).toBe(19 * HOUR);
  });

  test('keeps the compare dates stable between renders within the same hour', () => {
    const { result, rerender } = renderHook(() => useDateRange());
    const first = result.current.dateCompare;

    vi.advanceTimersByTime(10 * 60 * 1000);
    rerender();

    expect(result.current.dateCompare).toEqual(first);
  });

  test('measures elapsed time on the same clock as a timezone-adjusted range', () => {
    const timezone = 'Asia/Tokyo';
    const { result } = renderHook(() => useDateRange({ timezone }));
    const { dateRange, dateCompare } = result.current;
    const elapsed = +toZonedTime(NOW, timezone) - +dateRange.startDate;

    expect(comparedLength(dateCompare)).toBe(Math.floor(elapsed / HOUR) * HOUR);
  });

  // Metric cards hide their change while this is false; otherwise every count showed +100%.
  test('has nothing to compare before the first whole hour of the period', () => {
    vi.setSystemTime(new Date('2026-07-24T00:20:00'));
    const { result } = renderHook(() => useDateRange());

    expect(result.current.hasComparison).toBe(false);
  });

  test('has a comparison once a whole hour of the period has elapsed', () => {
    const { result } = renderHook(() => useDateRange());

    expect(result.current.hasComparison).toBe(true);
  });
});
