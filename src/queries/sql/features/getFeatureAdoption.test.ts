import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getFeatureAdoption } from './getFeatureAdoption';

const {
  state,
  prismaRawQuery,
  prismaParseFilters,
  prismaGetDateSQL,
  prismaGetAddIntervalQuery,
  clickhouseRawQuery,
  clickhouseParseFilters,
  clickhouseGetDateSQL,
} = vi.hoisted(() => ({
  state: { mode: 'prisma' as 'prisma' | 'clickhouse' },
  prismaRawQuery: vi.fn(),
  prismaParseFilters: vi.fn(),
  prismaGetDateSQL: vi.fn(),
  prismaGetAddIntervalQuery: vi.fn(),
  clickhouseRawQuery: vi.fn(),
  clickhouseParseFilters: vi.fn(),
  clickhouseGetDateSQL: vi.fn(),
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
    getDateSQL: prismaGetDateSQL,
    getAddIntervalQuery: prismaGetAddIntervalQuery,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQuery,
    parseFilters: clickhouseParseFilters,
    getDateSQL: clickhouseGetDateSQL,
  },
}));

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: 'and website_event.device = {{device}}',
  joinSessionQuery: 'inner join session on session.session_id = website_event.session_id',
  cohortQuery: '',
};

const baseParameters = {
  startDate: new Date('2026-05-01T00:00:00.000Z'),
  endDate: new Date('2026-05-31T00:00:00.000Z'),
  feature: 'checkout_started',
};

const totalsRow = {
  activeUsers: 1000,
  featureUsers: 200,
  newUsers: 120,
};

const totalsRowWithCompletion = {
  ...totalsRow,
  completedUsers: 80,
};

const seriesRows = [{ date: '2026-05-01', featureUsers: 50, newUsers: 30 }];

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  prismaGetDateSQL.mockReset();
  prismaGetAddIntervalQuery.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();
  clickhouseGetDateSQL.mockReset();

  prismaParseFilters.mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReturnValue(parseFiltersResult);
  prismaGetDateSQL.mockReturnValue('DAY(created_at)');
  clickhouseGetDateSQL.mockReturnValue('toDay(created_at)');
  prismaGetAddIntervalQuery.mockImplementation(
    (field: string, interval: string) => `${field} + interval '${interval}'`,
  );

  prismaRawQuery.mockResolvedValueOnce([totalsRow]).mockResolvedValueOnce(seriesRows);
  clickhouseRawQuery.mockResolvedValueOnce([totalsRow]).mockResolvedValueOnce(seriesRows);
});

describe('getFeatureAdoption postgres branch', () => {
  test('queries totals and a daily series and derives adoption / returning / completion', async () => {
    const result = await getFeatureAdoption('website-1', baseParameters, {});

    expect(prismaRawQuery).toHaveBeenCalledTimes(2);
    expect(clickhouseRawQuery).not.toHaveBeenCalled();

    const [totalsQuery] = prismaRawQuery.mock.calls[0];
    expect(totalsQuery).toContain('WITH feature_events AS');
    expect(totalsQuery).toContain('feature_sessions AS');
    expect(totalsQuery).toContain('active_sessions AS');
    expect(totalsQuery).toContain('first_use AS');
    expect(totalsQuery).toContain('and website_event.event_name = {{feature}}');
    expect(totalsQuery).toContain('as "activeUsers"');

    expect(result).toMatchObject({
      feature: 'checkout_started',
      successEvent: null,
      activeUsers: 1000,
      featureUsers: 200,
      newUsers: 120,
      returningUsers: 80,
      completedUsers: 0,
      completionRate: 0,
    });
    expect(result.adoptionRate).toBeCloseTo(20);
    expect(result.series[0]).toMatchObject({
      date: '2026-05-01',
      featureUsers: 50,
      newUsers: 30,
      returningUsers: 20,
    });
  });

  test('applies the selected filters to the feature events used for completion', async () => {
    await getFeatureAdoption(
      'website-1',
      { ...baseParameters, successEvent: 'checkout_completed' },
      {},
    );

    const [totalsQuery] = prismaRawQuery.mock.calls[0];
    // The filtered feature_events CTE must feed completion, not an unfiltered scan.
    const completionBlock = totalsQuery.slice(totalsQuery.indexOf('"completedUsers"') - 600);
    expect(completionBlock).toContain('from feature_events fe');
  });

  test('computes completion from any feature occurrence within the window', async () => {
    prismaRawQuery.mockReset();
    prismaRawQuery
      .mockResolvedValueOnce([totalsRowWithCompletion])
      .mockResolvedValueOnce(seriesRows);

    const result = await getFeatureAdoption(
      'website-1',
      { ...baseParameters, successEvent: 'checkout_completed', window: 30 },
      {},
    );

    const [totalsQuery] = prismaRawQuery.mock.calls[0];
    expect(totalsQuery).toContain('join website_event se');
    expect(totalsQuery).toContain('and se.event_name = {{successEvent}}');
    expect(totalsQuery).toContain('and se.created_at >= fe.created_at');
    expect(totalsQuery).toContain("fe.created_at + interval '30 minute'");
    expect(prismaGetAddIntervalQuery).toHaveBeenCalledWith('fe.created_at', '30 minute');

    expect(result.successEvent).toBe('checkout_completed');
    expect(result.completedUsers).toBe(80);
    expect(result.completionRate).toBeCloseTo(40);
  });

  test('series only counts a first use that falls inside the range', async () => {
    await getFeatureAdoption('website-1', baseParameters, {});

    const [seriesQuery] = prismaRawQuery.mock.calls[1];
    expect(seriesQuery).toContain('u.first_used_at between {{startDate}} and {{endDate}}');
  });

  test('passes the feature and success event to the query params', async () => {
    await getFeatureAdoption(
      'website-1',
      { ...baseParameters, successEvent: 'checkout_completed' },
      {},
    );

    const [, params] = prismaRawQuery.mock.calls[0];
    expect(params).toMatchObject({
      websiteId: 'website-1',
      feature: 'checkout_started',
      successEvent: 'checkout_completed',
    });
  });
});

describe('getFeatureAdoption clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('emits clickhouse bindings, a filtered feature_events CTE and uniqIf series', async () => {
    const result = await getFeatureAdoption(
      'website-1',
      { ...baseParameters, successEvent: 'checkout_completed' },
      {},
    );

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(2);
    expect(prismaRawQuery).not.toHaveBeenCalled();

    const [totalsQuery] = clickhouseRawQuery.mock.calls[0];
    expect(totalsQuery).toContain('WITH feature_events AS');
    expect(totalsQuery).toContain('event_name = {feature:String}');
    expect(totalsQuery).toContain('join website_event se');
    expect(totalsQuery).toContain('and se.event_name = {successEvent:String}');
    expect(totalsQuery).toContain('as activeUsers');

    const [seriesQuery] = clickhouseRawQuery.mock.calls[1];
    expect(seriesQuery).toContain('uniqIf(website_event.session_id');
    expect(seriesQuery).toContain(
      'u.first_used_at between {startDate:DateTime64} and {endDate:DateTime64}',
    );

    expect(result.adoptionRate).toBeCloseTo(20);
  });
});
