import { afterEach, describe, expect, test, vi } from 'vitest';

const prismaParseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.url_path = {{path}}',
  dateQuery: 'and website_event.created_at between {{startDate}} and {{endDate}}',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  joinSessionQuery: 'inner join session on website_event.session_id = session.session_id and website_event.website_id = session.website_id',
};

const clickhouseParseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and url_path = {path:String}',
  dateQuery: 'and created_at between {startDate:DateTime64} and {endDate:DateTime64}',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  joinSessionQuery: '',
};

async function loadModule({
  mode,
}: {
  mode: 'prisma' | 'clickhouse';
}) {
  vi.resetModules();

  const state = { mode };
  const prismaRawQuery = vi
    .fn()
    .mockResolvedValueOnce([{ num: '25' }])
    .mockResolvedValueOnce([{ id: 'event-1' }]);
  const prismaParseFilters = vi.fn().mockReturnValue(prismaParseFiltersResult);
  const clickhouseRawQuery = vi
    .fn()
    .mockResolvedValueOnce([{ num: '25' }])
    .mockResolvedValueOnce([{ event_id: 'event-1', created_at: '2026-08-05 10:00:00' }])
    .mockResolvedValueOnce([{ id: 'event-1' }]);
  const clickhouseParseFilters = vi.fn().mockReturnValue(clickhouseParseFiltersResult);

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

  const mod = await import('./getWebsiteEvents');

  return {
    getWebsiteEvents: mod.getWebsiteEvents,
    prismaRawQuery,
    clickhouseRawQuery,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getWebsiteEvents', () => {
  test('postgres counts from the lightweight filtered event query and enriches only the paged rows', async () => {
    const { getWebsiteEvents, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    const result = await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
      maxResults: 10000,
      orderBy: 'createdAt',
      search: 'signup',
    } as any);

    const [countQuery] = prismaRawQuery.mock.calls[0];
    const [dataQuery] = prismaRawQuery.mock.calls[1];

    expect(countQuery).toContain('select count(*) as num from (select 1 from (');
    expect(countQuery).not.toContain('exists(');
    expect(dataQuery).toContain('with paged_events as (');
    expect(dataQuery).toContain('paged_event_data as (');
    expect(dataQuery).toContain('join paged_events on paged_events.event_id = event_data.website_event_id');
    expect(dataQuery).toContain('where event_data.website_id = {{websiteId::uuid}}');
    expect(dataQuery).toContain('and event_data.created_at between {{startDate}} and {{endDate}}');
    expect(dataQuery).toContain('left join paged_event_data on paged_event_data.event_id = website_event.event_id');
    expect(dataQuery).toContain('order by paged_events.created_at desc');
    expect(dataQuery).toContain('(paged_event_data.event_id is not null) as "hasData"');
    expect(result).toEqual({
      data: [{ id: 'event-1' }],
      count: 25,
      page: 1,
      pageSize: 20,
      orderBy: 'createdAt',
      isCapped: false,
    });
  });

  test('clickhouse counts from the lightweight filtered event query and hydrates wide rows from candidate ids', async () => {
    const { getWebsiteEvents, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    const result = await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
      maxResults: 10000,
      orderBy: 'createdAt',
      search: 'signup',
    } as any);

    const [countQuery] = clickhouseRawQuery.mock.calls[0];
    const [pagedEventsQuery] = clickhouseRawQuery.mock.calls[1];
    const [dataQuery, dataParams] = clickhouseRawQuery.mock.calls[2];

    expect(countQuery).toContain('select count(*) as num from (select 1 from (');
    expect(countQuery).not.toContain('event_data');
    expect(pagedEventsQuery).toContain('select');
    expect(pagedEventsQuery).toContain('event_id,');
    expect(pagedEventsQuery).toContain('created_at');
    expect(pagedEventsQuery).toContain('from website_event');
    expect(pagedEventsQuery).toContain('and url_path = {path:String}');
    expect(pagedEventsQuery).toContain('positionCaseInsensitive');
    expect(pagedEventsQuery).toContain('order by created_at desc');
    expect(pagedEventsQuery).toContain('limit 20 offset 0');
    expect(dataQuery).toContain('paged_event_data as (');
    expect(dataQuery).toContain('where website_id = {websiteId:UUID}');
    expect(dataQuery).toContain('from umami.event_data_pivot');
    expect(dataQuery).toContain('and event_id in {eventIds:Array(UUID)}');
    expect(dataQuery).toContain(
      'and event_data_pivot.created_at between {startDate:DateTime64} and {endDate:DateTime64}',
    );
    expect(dataQuery).toContain('from website_event');
    expect(dataQuery).toContain(
      'left join paged_event_data on paged_event_data.event_id = website_event.event_id',
    );
    expect(dataQuery).toContain('order by indexOf({eventIds:Array(UUID)}, website_event.event_id)');
    expect(dataQuery).toContain('toUInt8(1) as has_data');
    expect(dataQuery).toContain('ifNull(paged_event_data.has_data, 0) as hasData');
    expect(dataParams).toMatchObject({ eventIds: ['event-1'] });
    expect(result).toEqual({
      data: [{ id: 'event-1' }],
      count: '25',
      page: 1,
      pageSize: 20,
      orderBy: 'createdAt',
      search: 'signup',
      isCapped: false,
    });
  });

  test('clickhouse reuses the parsed date filter for hasData so timezone-aware ranges stay aligned', async () => {
    vi.resetModules();

    const clickhouseRawQuery = vi
      .fn()
      .mockResolvedValueOnce([{ num: '25' }])
      .mockResolvedValueOnce([{ event_id: 'event-1', created_at: '2026-08-05 10:00:00' }])
      .mockResolvedValueOnce([{ id: 'event-1' }]);

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
          ...clickhouseParseFiltersResult,
          dateQuery:
            'and created_at between toTimezone({startDate:DateTime64},{timezone:String}) and toTimezone({endDate:DateTime64},{timezone:String})',
        }),
      },
    }));

    const { getWebsiteEvents } = await import('./getWebsiteEvents');

    await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
      timezone: 'America/Los_Angeles',
    } as any);

    const [dataQuery] = clickhouseRawQuery.mock.calls[2];

    expect(dataQuery).toContain(
      'and event_data_pivot.created_at between toTimezone({startDate:DateTime64},{timezone:String}) and toTimezone({endDate:DateTime64},{timezone:String})',
    );
    expect(dataQuery).not.toContain(
      'and created_at between {startDate:DateTime64} and {endDate:DateTime64}',
    );
  });

  test('clickhouse narrows row fetches to candidate ids when there are no filters, cohorts, or search', async () => {
    vi.resetModules();

    const clickhouseRawQuery = vi
      .fn()
      .mockResolvedValueOnce([{ num: '10000' }])
      .mockResolvedValueOnce([{ event_id: 'event-1', created_at: '2026-08-05 10:00:00' }])
      .mockResolvedValueOnce([{ id: 'event-1' }]);

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
          ...clickhouseParseFiltersResult,
          filterQuery: '',
          cohortQuery: '',
        }),
      },
    }));

    const { getWebsiteEvents } = await import('./getWebsiteEvents');

    await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
      maxResults: 10000,
    } as any);

    const [countQuery] = clickhouseRawQuery.mock.calls[0];
    const [pagedEventsQuery] = clickhouseRawQuery.mock.calls[1];
    const [dataQuery, dataParams] = clickhouseRawQuery.mock.calls[2];

    expect(countQuery).toContain('select count(*) as num from (select 1 from (');
    expect(countQuery).toContain('from website_event');
    expect(countQuery).not.toContain('from website_event_stats_hourly');
    expect(pagedEventsQuery).toContain('select');
    expect(pagedEventsQuery).toContain('event_id,');
    expect(pagedEventsQuery).toContain('created_at');
    expect(pagedEventsQuery).toContain('from website_event');
    expect(pagedEventsQuery).toContain('limit 20 offset 0');
    expect(pagedEventsQuery).not.toContain('positionCaseInsensitive');
    expect(dataQuery).toContain('and event_id in {eventIds:Array(UUID)}');
    expect(dataQuery).toContain('from website_event');
    expect(dataQuery).toContain('order by indexOf({eventIds:Array(UUID)}, website_event.event_id)');
    expect(dataParams).toMatchObject({ eventIds: ['event-1'] });
  });

  test('clickhouse returns an empty page without running the wide hydration query when no ids match', async () => {
    vi.resetModules();

    const clickhouseRawQuery = vi
      .fn()
      .mockResolvedValueOnce([{ num: '0' }])
      .mockResolvedValueOnce([]);

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
        parseFilters: vi.fn().mockReturnValue(clickhouseParseFiltersResult),
      },
    }));

    const { getWebsiteEvents } = await import('./getWebsiteEvents');

    const result = await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
    } as any);

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      data: [],
      count: '0',
      page: 1,
      pageSize: 20,
      orderBy: undefined,
      search: undefined,
      isCapped: false,
    });
  });
});
