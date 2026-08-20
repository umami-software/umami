import { afterEach, describe, expect, test, vi } from 'vitest';

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.url_path = {{path}}',
  joinSessionQuery: 'join session on session.session_id = website_event.session_id',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  excludeBounceQuery: 'join excludeBounce on excludeBounce.visit_id = website_event.visit_id',
};

async function loadModule({
  mode,
}: {
  mode: 'prisma' | 'clickhouse';
}) {
  vi.resetModules();

  const state = { mode };
  const prismaRawQuery = vi.fn().mockResolvedValue([{}]);
  const prismaParseFilters = vi.fn().mockReturnValue(parseFiltersResult);
  const getTimestampDiffSQL = vi.fn().mockReturnValue('ts_diff(t.min_time, t.max_time)');
  const clickhouseRawQuery = vi.fn().mockResolvedValue([{}]);
  const clickhouseParseFilters = vi.fn().mockReturnValue(parseFiltersResult);

  vi.doMock('@/lib/db', () => ({
    CLICKHOUSE: 'clickhouse',
    PRISMA: 'prisma',
    runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
  }));

  vi.doMock('@/lib/prisma', () => ({
    default: {
      rawQuery: prismaRawQuery,
      parseFilters: prismaParseFilters,
      getTimestampDiffSQL,
    },
  }));

  vi.doMock('@/lib/clickhouse', () => ({
    default: {
      rawQuery: clickhouseRawQuery,
      parseFilters: clickhouseParseFilters,
    },
  }));

  const mod = await import('./getPageviewExpandedMetrics');

  return {
    getPageviewExpandedMetrics: mod.getPageviewExpandedMetrics,
    prismaRawQuery,
    clickhouseRawQuery,
    getTimestampDiffSQL,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getPageviewExpandedMetrics postgres branch', () => {
  test('skips bounce and duration work for expanded pageview rows', async () => {
    const { getPageviewExpandedMetrics, prismaRawQuery, getTimestampDiffSQL } = await loadModule({
      mode: 'prisma',
    });

    await getPageviewExpandedMetrics('website-1', { type: 'referrer' }, { path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('0 as "bounces"');
    expect(query).toContain('0 as "totaltime"');
    expect(query).not.toContain('left join (');
    expect(query).not.toContain('min(website_event.created_at) as "min_time"');
    expect(query).not.toContain('max(website_event.created_at) as "max_time"');
    expect(query).not.toContain('event_type = 2');
    expect(getTimestampDiffSQL).not.toHaveBeenCalled();
  });
});

describe('getPageviewExpandedMetrics clickhouse branch', () => {
  test('skips bounce and duration work for expanded pageview rows', async () => {
    const { getPageviewExpandedMetrics, clickhouseRawQuery } = await loadModule({
      mode: 'clickhouse',
    });

    await getPageviewExpandedMetrics('website-1', { type: 'referrer' }, { path: '/pricing' } as any);

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('0 as "bounces"');
    expect(query).toContain('0 as "totaltime"');
    expect(query).not.toContain('left join (');
    expect(query).not.toContain('min(created_at) min_time');
    expect(query).not.toContain('max(created_at) max_time');
    expect(query).not.toContain('sum(max_time-min_time)');
    expect(query).not.toContain('event_type = 2');
  });
});
