import { renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
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
