import { renderHook } from '@testing-library/react';
import { fromZonedTime } from 'date-fns-tz';
import { expect, test, vi } from 'vitest';
import { useAnalyticsQuery } from './useAnalyticsQuery';
import { useFunnelQuery } from './useFunnelQuery';
import { usePerformanceStatsQuery } from './usePerformanceStatsQuery';
import { useUTMMetricsQuery } from './useUTMMetricsQuery';

const mocks = vi.hoisted(() => ({ get: vi.fn(), query: vi.fn((options: any) => options) }));
vi.mock('../useApi', () => ({ useApi: () => ({ get: mocks.get, useQuery: mocks.query }) }));
vi.mock('../useDateParameters', () => ({
  useDateParameters: () => ({ startAt: 1000, endAt: 2000, timezone: 'UTC', unit: 'day' }),
}));
vi.mock('../useFilterParameters', () => ({
  useFilterParameters: () => ({ browser1: 'eq.Chrome' }),
}));
vi.mock('../useModified', () => ({ useModified: () => ({ modified: 1 }) }));
vi.mock('../useTimezone', () => ({
  useTimezone: () => ({ toUtc: (date: Date) => fromZonedTime(date, 'Asia/Tokyo') }),
}));

test('saved funnels use ID stats with global dates, timezone, and filters', async () => {
  renderHook(() => useFunnelQuery({ websiteId: 'w', id: 'saved', steps: [] }));
  const options = mocks.query.mock.lastCall[0];
  await options.queryFn();
  expect(mocks.get.mock.lastCall).toEqual([
    '/websites/w/funnels/saved/stats',
    { startAt: 1000, endAt: 2000, timezone: 'UTC', unit: 'day', browser1: 'eq.Chrome' },
  ]);
});

test('UTM widgets fetch only their selected dimension', async () => {
  renderHook(() => useUTMMetricsQuery({ websiteId: 'w', type: 'utm_source' }));
  await mocks.query.mock.lastCall[0].queryFn();
  expect(mocks.get.mock.lastCall[0]).toBe('/websites/w/utm/metrics');
  expect(mocks.get.mock.lastCall[1].type).toBe('utm_source');
});

test('performance stats cache does not depend on a selected chart metric', () => {
  renderHook(() => usePerformanceStatsQuery({ websiteId: 'w' }));
  expect(mocks.query.mock.lastCall[0].queryKey).toEqual([
    'websites:performance/stats',
    {
      websiteId: 'w',
      startAt: 1000,
      endAt: 2000,
      timezone: 'UTC',
      unit: 'day',
      browser1: 'eq.Chrome',
      modified: 1,
    },
  ]);
});

test('uses the global date range when a page passes no dates', () => {
  renderHook(() => useAnalyticsQuery('goals/stats', { websiteId: 'w' }));

  expect(mocks.query.mock.lastCall[0].queryKey[1]).toMatchObject({ startAt: 1000, endAt: 2000 });
});

// Regression test: report pages pass profile-timezone wall-clock dates, which used to be sent
// to the API as if they were already UTC, shifting the window by the browser's offset.
test('converts page dates from profile-timezone wall-clock time to UTC', () => {
  const startDate = new Date('2026-07-01T00:00:00');
  const endDate = new Date('2026-07-31T23:59:59.999');

  renderHook(() => useAnalyticsQuery('goals/stats', { websiteId: 'w', startDate, endDate }));

  expect(mocks.query.mock.lastCall[0].queryKey[1]).toMatchObject({
    startAt: +fromZonedTime(startDate, 'Asia/Tokyo'),
    endAt: +fromZonedTime(endDate, 'Asia/Tokyo'),
  });
});
