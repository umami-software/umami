import { afterEach, describe, expect, test, vi } from 'vitest';

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.url_path = {{path}}',
  joinSessionQuery: 'join session on session.session_id = website_event.session_id',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
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
    },
  }));

  vi.doMock('@/lib/clickhouse', () => ({
    default: {
      rawQuery: clickhouseRawQuery,
      parseFilters: clickhouseParseFilters,
    },
  }));

  const mod = await import('./getWebsiteEventStats');

  return {
    getWebsiteEventStats: mod.getWebsiteEventStats,
    prismaRawQuery,
    clickhouseRawQuery,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getWebsiteEventStats', () => {
  test('postgres aggregates directly from filtered custom events', async () => {
    const { getWebsiteEventStats, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    await getWebsiteEventStats('website-1', { path: '/pricing' } as any);

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('cast(count(*) as bigint) as "events"');
    expect(query).toContain('count(distinct website_event.session_id) as "visitors"');
    expect(query).toContain('count(distinct website_event.visit_id) as "visits"');
    expect(query).toContain('count(distinct website_event.event_name) as "uniqueEvents"');
    expect(query).toContain('from website_event');
    expect(query).toContain('join session on session.session_id = website_event.session_id');
    expect(query).not.toContain('group by 1, 2, 3');
    expect(query).not.toContain('sum(t.c)');
  });

  test('clickhouse aggregates directly from filtered custom events', async () => {
    const { getWebsiteEventStats, clickhouseRawQuery } = await loadModule({
      mode: 'clickhouse',
    });

    await getWebsiteEventStats('website-1', { path: '/pricing' } as any);

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('count(*) as "events"');
    expect(query).toContain('uniq(session_id) as "visitors"');
    expect(query).toContain('uniq(visit_id) as "visits"');
    expect(query).toContain('uniq(event_name) as "uniqueEvents"');
    expect(query).toContain('from website_event');
    expect(query).not.toContain('group by session_id, visit_id, event_name');
    expect(query).not.toContain('sum(t.c)');
  });

  test('clickhouse uses the hourly rollup when there are no extra filters', async () => {
    vi.resetModules();

    const clickhouseRawQuery = vi.fn().mockResolvedValue([{}]);

    vi.doMock('@/lib/db', () => ({
      CLICKHOUSE: 'clickhouse',
      PRISMA: 'prisma',
      runQuery: vi.fn((queries: Record<string, () => unknown>) => queries.clickhouse()),
    }));

    vi.doMock('@/lib/prisma', () => ({
      default: {},
    }));

    vi.doMock('@/lib/clickhouse', () => ({
      default: {
        rawQuery: clickhouseRawQuery,
        parseFilters: vi.fn().mockReturnValue({
          queryParams: { websiteId: 'website-1' },
          filterQuery: '',
          cohortQuery: '',
        }),
      },
    }));

    const { getWebsiteEventStats } = await import('./getWebsiteEventStats');

    await getWebsiteEventStats('website-1', {} as any);

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('sum(length(event_name)) as "events"');
    expect(query).toContain('uniqArray(event_name) as "uniqueEvents"');
    expect(query).toContain('from website_event_stats_hourly website_event');
    expect(query).not.toContain('from website_event\n');
  });
});
