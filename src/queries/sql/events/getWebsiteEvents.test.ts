import { afterEach, describe, expect, test, vi } from 'vitest';

const prismaParseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.url_path = {{path}}',
  dateQuery: 'and website_event.created_at between {{startDate}} and {{endDate}}',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  joinSessionQuery: '',
};

const clickhouseParseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and url_path = {path:String}',
  dateQuery: 'and created_at between {startDate:DateTime64} and {endDate:DateTime64}',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
  joinSessionQuery: '',
};

async function loadModule({ mode }: { mode: 'prisma' | 'clickhouse' }) {
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
  test('postgres counts from the lightweight filtered event query and keeps paged rows even when session enrichment is missing', async () => {
    const { getWebsiteEvents, prismaRawQuery } = await loadModule({ mode: 'prisma' });

    const result = await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
      maxResults: 10000,
      orderBy: 'createdAt',
      search: 'signup',
    } as any);

    const [countQuery] = prismaRawQuery.mock.calls[0];
    const [, countParams] = prismaRawQuery.mock.calls[0];
    const [dataQuery] = prismaRawQuery.mock.calls[1];
    const [, dataParams] = prismaRawQuery.mock.calls[1];

    expect(countQuery).toContain('select count(*) as num from (select 1 from (');
    expect(countQuery).not.toContain('exists(');
    expect(countQuery).toContain('event_name ilike {{eventSearch}}');
    expect(countQuery).not.toContain('inner join session on website_event.session_id');
    expect(dataQuery).toContain('with paged_events as (');
    expect(dataQuery).toContain('paged_event_data as (');
    expect(dataQuery).toContain(
      'join paged_events on paged_events.event_id = event_data.website_event_id',
    );
    expect(dataQuery).toContain('where event_data.website_id = {{websiteId::uuid}}');
    expect(dataQuery).toContain('and event_data.created_at between {{startDate}} and {{endDate}}');
    expect(dataQuery).toContain(
      'left join paged_event_data on paged_event_data.event_id = website_event.event_id',
    );
    expect(dataQuery).toContain(
      'left join session on session.session_id = website_event.session_id',
    );
    expect(dataQuery).toContain('order by paged_events.created_at desc');
    expect(dataQuery).toContain('(paged_event_data.event_id is not null) as "hasData"');
    expect(countParams).toMatchObject({ eventSearch: '%signup%' });
    expect(dataParams).toMatchObject({ eventSearch: '%signup%' });
    expect(result).toEqual({
      data: [{ id: 'event-1' }],
      count: 25,
      page: 1,
      pageSize: 20,
      orderBy: 'createdAt',
      isCapped: false,
    });
  });

  test('clickhouse counts from the lightweight filtered event query and resolves hasData from paged ids', async () => {
    const { getWebsiteEvents, clickhouseRawQuery } = await loadModule({ mode: 'clickhouse' });

    const result = await getWebsiteEvents('website-1', {
      page: 1,
      pageSize: 20,
      maxResults: 10000,
      orderBy: 'createdAt',
      search: 'signup',
    } as any);

    const [countQuery] = clickhouseRawQuery.mock.calls[0];
    const [dataQuery] = clickhouseRawQuery.mock.calls[1];

    expect(countQuery).toContain('select count(*) as num from (select 1 from (');
    expect(countQuery).not.toContain('event_data');
    expect(dataQuery).toContain('with paged_events as (');
    expect(dataQuery).toContain('website_id as websiteId');
    expect(dataQuery).toContain('paged_event_data as (');
    expect(dataQuery).toContain('where website_id = {websiteId:UUID}');
    expect(dataQuery).toContain('from umami.event_data_pivot');
    expect(dataQuery).toContain(
      'inner join paged_events on paged_events.id = event_data_pivot.event_id',
    );
    expect(dataQuery).toContain(
      'and event_data_pivot.created_at between {startDate:DateTime64} and {endDate:DateTime64}',
    );
    expect(dataQuery).toContain('from paged_events');
    expect(dataQuery).toContain(
      'left join paged_event_data on paged_event_data.event_id = paged_events.id',
    );
    expect(dataQuery).toContain('order by paged_events.createdAt desc');
    expect(dataQuery).toContain('toUInt8(1) as has_data');
    expect(dataQuery).toContain('ifNull(paged_event_data.has_data, 0) as hasData');
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

    const [dataQuery] = clickhouseRawQuery.mock.calls[1];

    expect(dataQuery).toContain(
      'and event_data_pivot.created_at between toTimezone({startDate:DateTime64},{timezone:String}) and toTimezone({endDate:DateTime64},{timezone:String})',
    );
    expect(dataQuery).not.toContain(
      'and created_at between {startDate:DateTime64} and {endDate:DateTime64}',
    );
  });
});
