import { afterEach, describe, expect, test, vi } from 'vitest';

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.url_path = {{path}}',
  dateQuery: 'and website_event.created_at between {{startDate}} and {{endDate}}',
  cohortQuery: '',
};

/** The `join (...) session_duration` clause used to measure the visit span. */
function getDurationJoin(query: string) {
  const start = query.indexOf('join (');
  const end = query.indexOf(') session_duration');

  return start === -1 || end === -1 ? '' : query.slice(start, end);
}

async function loadModule(mode: 'prisma' | 'clickhouse') {
  vi.resetModules();

  const state = { mode };
  const prismaPagedRawQuery = vi.fn().mockResolvedValue({ data: [], count: 0 });
  const prismaParseFilters = vi.fn().mockReturnValue(parseFiltersResult);
  const clickhousePagedRawQuery = vi.fn().mockResolvedValue({ data: [], count: 0 });
  const clickhouseParseFilters = vi.fn().mockReturnValue(parseFiltersResult);

  vi.doMock('@/lib/db', () => ({
    CLICKHOUSE: 'clickhouse',
    PRISMA: 'prisma',
    runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
  }));

  vi.doMock('@/lib/prisma', () => ({
    default: {
      pagedRawQuery: prismaPagedRawQuery,
      parseFilters: prismaParseFilters,
    },
  }));

  vi.doMock('@/lib/clickhouse', () => ({
    default: {
      pagedRawQuery: clickhousePagedRawQuery,
      parseFilters: clickhouseParseFilters,
      getDateStringSQL: (field: string) => field,
    },
  }));

  const mod = await import('./getWebsiteSessions');

  return {
    getWebsiteSessions: mod.getWebsiteSessions,
    prismaPagedRawQuery,
    clickhousePagedRawQuery,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getWebsiteSessions minDuration (postgres)', () => {
  test('measures duration from an aggregate that ignores event filters', async () => {
    const { getWebsiteSessions, prismaPagedRawQuery } = await loadModule('prisma');

    await getWebsiteSessions('website-1', { minDuration: 60, path: '/pricing' } as any);

    const [query] = prismaPagedRawQuery.mock.calls[0];
    const duration = getDurationJoin(query);

    // The event filter still selects sessions...
    expect(query).toContain('and website_event.url_path = {{path}}');
    // ...but the measured span comes from the session's own events.
    expect(duration).toContain('group by website_event.session_id');
    expect(duration).toContain('min(website_event.created_at) as "firstAt"');
    expect(duration).toContain('max(website_event.created_at) as "lastAt"');
    expect(duration).not.toContain('url_path = {{path}}');
    expect(query).toContain('having extract(epoch from');
  });

  test('skips the duration aggregate when minDuration is not set', async () => {
    const { getWebsiteSessions, prismaPagedRawQuery } = await loadModule('prisma');

    await getWebsiteSessions('website-1', {} as any);

    const [query] = prismaPagedRawQuery.mock.calls[0];

    expect(query).not.toContain('session_duration');
  });
});

describe('getWebsiteSessions minDuration (clickhouse)', () => {
  test('raw event branch measures duration from an aggregate that ignores event filters', async () => {
    const { getWebsiteSessions, clickhousePagedRawQuery } = await loadModule('clickhouse');

    await getWebsiteSessions('website-1', { minDuration: 60, path: '/pricing' } as any);

    const [query] = clickhousePagedRawQuery.mock.calls[0];
    const duration = getDurationJoin(query);

    expect(query).toContain('and website_event.url_path = {{path}}');
    expect(duration).toContain('from website_event');
    expect(duration).toContain('min(created_at) as first_time');
    expect(duration).toContain('max(created_at) as last_time');
    expect(duration).not.toContain('url_path = {{path}}');
    expect(query).toContain('having toInt64(toUnixTimestamp');
  });

  test('hourly rollup branch measures duration from the same rollup', async () => {
    const { getWebsiteSessions, clickhousePagedRawQuery } = await loadModule('clickhouse');

    await getWebsiteSessions('website-1', { minDuration: 60 } as any);

    const [query] = clickhousePagedRawQuery.mock.calls[0];
    const duration = getDurationJoin(query);

    expect(query).toContain('from website_event_stats_hourly as website_event');
    expect(duration).toContain('from website_event_stats_hourly');
    expect(duration).toContain('min(min_time) as first_time');
    expect(duration).toContain('max(max_time) as last_time');
    expect(query).toContain('having toInt64(toUnixTimestamp');
  });
});
