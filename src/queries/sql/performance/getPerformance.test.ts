import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getPerformance } from './getPerformance';
import { getPerformanceChart } from './getPerformanceChart';
import { getPerformanceStats } from './getPerformanceStats';
const mocks = vi.hoisted(() => ({
  backend: 'prisma',
  rawQuery: vi.fn(),
  parseFilters: vi.fn(() => ({
    queryParams: {},
    filterQuery: 'and filtered',
    cohortQuery: '',
    joinSessionQuery: '',
  })),
}));
vi.mock('@/lib/db', () => ({
  PRISMA: 'prisma',
  CLICKHOUSE: 'clickhouse',
  runQuery: (queries: any) => queries[mocks.backend](),
}));
vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: mocks.rawQuery,
    parseFilters: mocks.parseFilters,
    getDateSQL: () => 'bucket',
  },
}));
vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: mocks.rawQuery,
    parseFilters: mocks.parseFilters,
    getDateSQL: () => 'bucket',
  },
}));
const parameters = {
  startDate: new Date(1000),
  endDate: new Date(2000),
  unit: 'day',
  timezone: 'UTC',
  metric: 'inp',
};

describe.each(['prisma', 'clickhouse'])('%s performance datasets', backend => {
  beforeEach(() => {
    mocks.backend = backend;
    mocks.rawQuery.mockReset().mockResolvedValue([]);
  });
  test('chart executes only the selected metric time series', async () => {
    expect(await getPerformanceChart('website', parameters, {})).toEqual({ chart: [] });
    expect(mocks.rawQuery).toHaveBeenCalledTimes(1);
    const sql = mocks.rawQuery.mock.calls[0][0];
    expect(sql).toContain('inp');
    expect(sql).toContain('group by t');
    expect(sql).not.toContain('lcp_p50');
    expect(sql).toContain('and filtered');
  });
  test('stats executes only the summary and preserves empty-result defaults', async () => {
    const stats = await getPerformanceStats('website', parameters, {});
    expect(stats.count).toBe(0);
    expect(stats.lcp).toEqual({ p50: 0, p75: 0, p95: 0 });
    expect(mocks.rawQuery).toHaveBeenCalledTimes(1);
    expect(mocks.rawQuery.mock.calls[0][0]).not.toContain('group by t');
  });
  test('legacy composition preserves the chart and summary shape', async () => {
    const result = await getPerformance('website', parameters, {});
    expect(mocks.rawQuery).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ chart: [], summary: { count: 0 } });
  });
});
