import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { DATE_RANGE_CONFIG } from '@/lib/constants';
import { setItem } from '@/lib/storage';

const query: Record<string, string> = {};

vi.mock('./useNavigation', () => ({
  useNavigation: () => ({ query }),
}));

vi.mock('./useLocale', () => ({
  useLocale: () => ({ locale: 'en-US' }),
}));

import { useDateRange } from './useDateRange';

afterEach(() => {
  delete query.date;
  localStorage.clear();
});

function expectDefaultRange(result: { current: ReturnType<typeof useDateRange> }) {
  expect(result.current.dateRange.value).toBe('24hour');
  expect(result.current.dateRange.startDate.getTime()).not.toBeNaN();
  expect(result.current.dateRange.endDate.getTime()).not.toBeNaN();
  expect(result.current.isCustomRange).toBe(false);
  expect(result.current.isAllTime).toBe(false);
}

describe('useDateRange', () => {
  test('falls back to the default range for an invalid custom range in the URL', () => {
    query.date = 'range:NaN:1767225600000:all';

    const { result } = renderHook(() => useDateRange());

    expectDefaultRange(result);
  });

  test('falls back to the default range for an invalid stored range', () => {
    setItem(DATE_RANGE_CONFIG, 'range:NaN:1767225600000');

    const { result } = renderHook(() => useDateRange());

    expectDefaultRange(result);
  });

  test('flags a valid custom range from the URL', () => {
    query.date = 'range:1767225600000:1767311999999';

    const { result } = renderHook(() => useDateRange());

    expect(result.current.dateRange.value).toBe(query.date);
    expect(result.current.isCustomRange).toBe(true);
  });
});
