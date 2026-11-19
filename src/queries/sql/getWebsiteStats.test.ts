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

  const mod = await import('./getWebsiteStats');

  return {
    getWebsiteStats: mod.getWebsiteStats,
    prismaRawQuery,
    clickhouseRawQuery,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getWebsiteStats default bounce path', () => {
  test('postgres uses a single grouped pass for the default path', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', {});

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('t.c = 1 and t.has_custom_event = 0');
    expect(query).toContain('max(case when website_event.event_type = 2 then 1 else 0 end) as "has_custom_event"');
    expect(query).not.toContain('left join (');
  });

  test('clickhouse uses the hourly aggregate view without the extra join', async () => {
    const { getWebsiteStats, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    await getWebsiteStats('website-1', {});

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('from website_event_stats_hourly "website_event"');
    expect(query).toContain('sumIf(1, t.c = 1 and t.has_custom_event = 0) as "bounces"');
    expect(query).toContain('has_custom_event');
    expect(query).not.toContain('left join (');
  });
});

describe('getWebsiteStats filtered bounce path', () => {
  test('postgres switches to the visit-events join when event filters are present', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', { path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('left join (');
    expect(query).toContain('coalesce(e.has_custom_event, 0) = 0');
    expect(query).toContain('event_type = 2');
  });

  test('clickhouse switches to the raw-event join when event filters are present', async () => {
    const { getWebsiteStats, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    await getWebsiteStats('website-1', { path: '/pricing' } as any);

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('from website_event');
    expect(query).toContain('left join (');
    expect(query).toContain('ifNull(e.has_custom_event, 0) = 0');
  });
});

describe('getWebsiteStats excludeBounce path', () => {
  test('clickhouse skips the extra join when excludeBounce is enabled', async () => {
    const { getWebsiteStats, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    await getWebsiteStats('website-1', { excludeBounce: true });

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('0 as "bounces"');
    expect(query).not.toContain('left join (');
  });

  test('postgres skips the extra join when excludeBounce is enabled on the filtered path', async () => {
    const { getWebsiteStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteStats('website-1', { excludeBounce: true, path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('0 as "bounces"');
    expect(query).not.toContain('left join (');
  });
});
