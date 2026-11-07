import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { DEFAULT_TIME_FORMAT, TIME_FORMATS } from '@/lib/constants';
import { setTimeFormat } from '@/store/app';
import { useLocale } from './useLocale';

describe('useLocale', () => {
  afterEach(() => {
    setTimeFormat(DEFAULT_TIME_FORMAT);
  });

  test('re-renders consumers and refreshes dateLocale when the clock format changes', () => {
    const { result } = renderHook(() => useLocale());

    expect(result.current.timeFormat).toBe(DEFAULT_TIME_FORMAT);
    expect(result.current.dateLocale.formatLong.time({ width: 'short' })).toBe('h:mm a');

    act(() => {
      setTimeFormat(TIME_FORMATS.h24);
    });

    expect(result.current.timeFormat).toBe(TIME_FORMATS.h24);
    expect(result.current.dateLocale.formatLong.time({ width: 'short' })).toBe('HH:mm');
  });
});
