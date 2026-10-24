import { afterEach, describe, expect, test, vi } from 'vitest';

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: '',
  joinSessionQuery: '',
  cohortQuery: '',
  excludeBounceQuery: '',
};

async function loadModule() {
  vi.resetModules();

  const clickhouseRawQuery = vi.fn().mockResolvedValue([]);

  vi.doMock('@/lib/db', () => ({
    CLICKHOUSE: 'clickhouse',
    PRISMA: 'prisma',
    runQuery: vi.fn((queries: Record<string, () => unknown>) => queries.clickhouse()),
  }));

  vi.doMock('@/lib/prisma', () => ({
    default: { rawQuery: vi.fn(), parseFilters: vi.fn().mockReturnValue(parseFiltersResult) },
  }));

  vi.doMock('@/lib/clickhouse', () => ({
    default: {
      rawQuery: clickhouseRawQuery,
      parseFilters: vi.fn().mockReturnValue(parseFiltersResult),
    },
  }));

  const mod = await import('./getPageviewMetrics');

  return { getPageviewMetrics: mod.getPageviewMetrics, clickhouseRawQuery };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getPageviewMetrics clickhouse branch', () => {
  test.each([
    ['entry', 'argMinMerge(entry_url)'],
    ['exit', 'argMaxMerge(exit_url)'],
  ])('takes the %s page of each visit, not of each session', async (type, merge) => {
    const { getPageviewMetrics, clickhouseRawQuery } = await loadModule();

    await getPageviewMetrics('website-1', { type }, {} as any);

    const [query] = clickhouseRawQuery.mock.calls[0];

    // The relational query finds the entry/exit page per visit. Merging the
    // hourly states per session instead keeps only the session's first entry
    // (or last exit), so pages that start or end a later visit go uncounted.
    expect(query).toContain(merge);
    expect(query).toMatch(/group by s, visit_id\b/);
  });
});
