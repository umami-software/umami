import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const useDateRangeMock = vi.fn();
const toUtcMock = vi.fn((date: Date) => date);
const localToUtcMock = vi.fn((date: Date) => date);

vi.mock('./useDateRange', () => ({
  useDateRange: (...args: unknown[]) => useDateRangeMock(...args),
}));

vi.mock('./useTimezone', () => ({
  useTimezone: () => ({
    timezone: 'America/New_York',
    toUtc: toUtcMock,
    localToUtc: localToUtcMock,
    canonicalizeTimezone: (tz: string) => tz,
  }),
}));

import { useDateParameters } from './useDateParameters';

describe('useDateParameters', () => {
  test('passes the profile timezone into useDateRange instead of ignoring it', () => {
    useDateRangeMock.mockReturnValue({
      dateRange: { startDate: new Date('2026-09-16T03:00:00Z'), endDate: new Date(), unit: 'hour' },
    });

    renderHook(() => useDateParameters());

    // Regression test: this used to call useDateRange() with no arguments at all,
    // silently computing "today" from the browser's own system clock instead of
    // the profile timezone setting.
    expect(useDateRangeMock).toHaveBeenCalledWith({ timezone: 'America/New_York' });
  });

  test('converts using the profile timezone, not the browser-local one', () => {
    const startDate = new Date('2026-09-16T03:00:00Z');
    const endDate = new Date('2026-09-17T03:00:00Z');
    useDateRangeMock.mockReturnValue({ dateRange: { startDate, endDate, unit: 'day' } });
    toUtcMock.mockClear();
    localToUtcMock.mockClear();

    renderHook(() => useDateParameters());

    // Regression test: this used to call localToUtc (browser-system-timezone-aware)
    // instead of toUtc (profile-timezone-aware) to produce the final startAt/endAt.
    expect(toUtcMock).toHaveBeenCalledWith(startDate);
    expect(toUtcMock).toHaveBeenCalledWith(endDate);
    expect(localToUtcMock).not.toHaveBeenCalled();
  });
});
