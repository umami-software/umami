import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getAttribution } from './getAttribution';

const { state, prismaRawQuery, prismaParseFilters, clickhouseRawQuery, clickhouseParseFilters } =
  vi.hoisted(() => ({
    state: { mode: 'prisma' as 'prisma' | 'clickhouse' },
    prismaRawQuery: vi.fn(),
    prismaParseFilters: vi.fn(),
    clickhouseRawQuery: vi.fn(),
    clickhouseParseFilters: vi.fn(),
  }));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: prismaRawQuery,
    parseFilters: prismaParseFilters,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQuery,
    parseFilters: clickhouseParseFilters,
  },
}));

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.utm_source = {{utmSource}}',
  joinSessionQuery: 'join session on session.session_id = website_event.session_id',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
};

const parameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  model: 'last-click',
  type: 'path',
  step: '/checkout',
};

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();

  prismaParseFilters.mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReturnValue(parseFiltersResult);
  prismaRawQuery.mockResolvedValue([]);
  clickhouseRawQuery.mockResolvedValue([]);
});

describe('getAttribution postgres branch', () => {
  test('runs eight rawQuery calls covering referrer, paid ads, utm columns and totals', async () => {
    await getAttribution('website-1', parameters, {});

    expect(prismaRawQuery).toHaveBeenCalledTimes(8);
    expect(clickhouseRawQuery).not.toHaveBeenCalled();

    const queries = prismaRawQuery.mock.calls.map(c => c[0] as string);
    expect(queries.some(q => q.includes('we.referrer_domain'))).toBe(true);
    expect(queries.some(q => q.includes("then 'Google Ads'"))).toBe(true);
    expect(queries.some(q => q.includes('we.utm_source'))).toBe(true);
    expect(queries.some(q => q.includes('we.utm_medium'))).toBe(true);
    expect(queries.some(q => q.includes('we.utm_campaign'))).toBe(true);
    expect(queries.some(q => q.includes('we.utm_content'))).toBe(true);
    expect(queries.some(q => q.includes('we.utm_term'))).toBe(true);
  });

  test('type=path selects url_path column and uses the step param', async () => {
    await getAttribution('website-1', parameters, {});

    // eventType / column derive from `type`; column is embedded in the SQL string
    const eventQueryCall = prismaRawQuery.mock.calls.find(c =>
      (c[0] as string).includes('WITH events AS'),
    );
    expect(eventQueryCall?.[0]).toContain('website_event.url_path = {{step}}');
    expect(prismaParseFilters).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId: 'website-1', eventType: 1 }),
    );
  });

  test('type=event selects event_name column and customEvent event type', async () => {
    await getAttribution('website-1', { ...parameters, type: 'event' }, {});

    const eventQueryCall = prismaRawQuery.mock.calls.find(c =>
      (c[0] as string).includes('WITH events AS'),
    );
    expect(eventQueryCall?.[0]).toContain('website_event.event_name = {{step}}');
    expect(prismaParseFilters).toHaveBeenCalledWith(expect.objectContaining({ eventType: 2 }));
  });

  test('first-click model uses min(created_at) with no upper-bound clause', async () => {
    await getAttribution('website-1', { ...parameters, model: 'first-click' }, {});

    const referrerQuery = prismaRawQuery.mock.calls
      .map(c => c[0] as string)
      .find(q => q.includes('we.referrer_domain') && q.includes('model AS'));
    expect(referrerQuery).toContain('min(we.created_at) created_at');
    expect(referrerQuery).not.toContain('and we.created_at < e.max_dt');
  });

  test('last-click model uses max(created_at) bounded by e.max_dt', async () => {
    await getAttribution('website-1', { ...parameters, model: 'last-click' }, {});

    const referrerQuery = prismaRawQuery.mock.calls
      .map(c => c[0] as string)
      .find(q => q.includes('we.referrer_domain') && q.includes('model AS'));
    expect(referrerQuery).toContain('max(we.created_at) created_at');
    expect(referrerQuery).toContain('and we.created_at < e.max_dt');
  });

  test('returns the shaped attribution result object', async () => {
    prismaRawQuery
      .mockResolvedValueOnce([{ name: 'a', value: 1 }]) // referrer
      .mockResolvedValueOnce([{ name: 'Google Ads', value: 2 }]) // paidAds
      .mockResolvedValueOnce([{ name: 's', value: 3 }]) // source
      .mockResolvedValueOnce([{ name: 'm', value: 4 }]) // medium
      .mockResolvedValueOnce([{ name: 'c', value: 5 }]) // campaign
      .mockResolvedValueOnce([{ name: 'ct', value: 6 }]) // content
      .mockResolvedValueOnce([{ name: 't', value: 7 }]) // term
      .mockResolvedValueOnce([{ pageviews: 10, visitors: 8, visits: 9 }]); // total

    const result = await getAttribution('website-1', parameters, {});

    expect(result.referrer).toEqual([{ name: 'a', value: 1 }]);
    expect(result.paidAds).toEqual([{ name: 'Google Ads', value: 2 }]);
    expect(result.utm_source).toEqual([{ name: 's', value: 3 }]);
    expect(result.total).toEqual({ pageviews: 10, visitors: 8, visits: 9 });
  });
});

describe('getAttribution clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('runs eight rawQuery calls with clickhouse-typed params', async () => {
    await getAttribution('website-1', parameters, {});

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(8);
    expect(prismaRawQuery).not.toHaveBeenCalled();

    const queries = clickhouseRawQuery.mock.calls.map(c => c[0] as string);
    expect(queries.some(q => q.includes('where website_id = {websiteId:UUID}'))).toBe(true);
    expect(
      queries.some(q =>
        q.includes('created_at between {startDate:DateTime64} and {endDate:DateTime64}'),
      ),
    ).toBe(true);
    // paid ads use multiIf in clickhouse rather than a CASE expression
    expect(queries.some(q => q.includes("multiIf(gclid != '', 'Google Ads'"))).toBe(true);
  });

  test('type=path uses url_path with {step:String} and pageView event type', async () => {
    await getAttribution('website-1', parameters, {});

    const eventQuery = clickhouseRawQuery.mock.calls
      .map(c => c[0] as string)
      .find(q => q.includes('WITH events AS'));
    expect(eventQuery).toContain('url_path = {step:String}');
    expect(clickhouseParseFilters).toHaveBeenCalledWith(expect.objectContaining({ eventType: 1 }));
  });

  test('first-click model uses min(created_at) with no upper bound', async () => {
    await getAttribution('website-1', { ...parameters, model: 'first-click' }, {});

    const referrerQuery = clickhouseRawQuery.mock.calls
      .map(c => c[0] as string)
      .find(q => q.includes('we.referrer_domain') && q.includes('model AS'));
    expect(referrerQuery).toContain('min(we.created_at) created_at');
    expect(referrerQuery).not.toContain('where we.created_at < e.max_dt');
  });
});
