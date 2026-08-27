import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getFunnel } from './getFunnel';

const {
  state,
  prismaRawQuery,
  prismaParseFilters,
  getAddIntervalQuery,
  clickhouseRawQuery,
  clickhouseParseFilters,
} = vi.hoisted(() => ({
  state: { mode: 'prisma' as 'prisma' | 'clickhouse' },
  prismaRawQuery: vi.fn(),
  prismaParseFilters: vi.fn(),
  getAddIntervalQuery: vi.fn(),
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
    getAddIntervalQuery,
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

const baseParameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  window: 30,
  steps: [
    { type: 'path', value: '/home' },
    { type: 'path', value: '/checkout' },
  ],
};

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  getAddIntervalQuery.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();

  prismaParseFilters.mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReturnValue(parseFiltersResult);
  getAddIntervalQuery.mockReturnValue('add_interval(l.created_at, 30 minute)');
  // formatResults reads results[0].count etc, so provide numeric counts
  prismaRawQuery.mockResolvedValue([{ count: 100 }, { count: 40 }]);
  clickhouseRawQuery.mockResolvedValue([{ count: 100 }, { count: 40 }]);
});

describe('getFunnel postgres branch', () => {
  test('builds level CTEs and a UNION sum query, one per step', async () => {
    await getFunnel('website-1', baseParameters, {});

    expect(prismaRawQuery).toHaveBeenCalledTimes(1);
    const [query, params] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('WITH level1 AS');
    expect(query).toContain(', level2 AS');
    expect(query).toContain('select 1 as level, count(distinct(session_id)) as count from level1');
    expect(query).toContain('union ');
    expect(query).toContain('select 2 as level, count(distinct(session_id)) as count from level2');
    expect(query).toContain('ORDER BY level');
    // step values become positional params keyed by index
    expect(params).toMatchObject({ 0: '/home', 1: '/checkout' });
    // merged with parseFilters queryParams
    expect(params).toMatchObject({ websiteId: 'website-1' });
    // level1 filters use equality against {{0}}; level2 against {{1}}
    expect(query).toContain('and url_path = {{0}}');
    expect(query).toContain('and we.url_path = {{1}}');
    // level2 window uses getAddIntervalQuery output
    expect(query).toContain('add_interval(l.created_at, 30 minute)');
    expect(getAddIntervalQuery).toHaveBeenCalledWith('l.created_at ', '30 minute');
  });

  test('wildcard step values switch to LIKE and translate * to %', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          { type: 'path', value: '/blog/*' },
          { type: 'path', value: '*/thanks' },
        ],
      },
      {},
    );

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and url_path like {{0}}');
    expect(query).toContain('and we.url_path like {{1}}');
    expect(params).toMatchObject({ 0: '/blog/%', 1: '%/thanks' });
  });

  test('event steps with contains filter emit exists() subqueries and ilike params', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          {
            type: 'event',
            value: 'purchase',
            filters: [{ property: 'plan', operator: 'c', value: 'pro' }],
          },
          { type: 'event', value: 'confirm' },
        ],
      },
      {},
    );

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and event_name = {{0}}');
    expect(query).toContain('and exists (');
    expect(query).toContain('_ed0_0.data_key = {{f_0_0_k}}');
    expect(query).toContain('ilike {{f_0_0_v}}');
    // contains -> ilike operator, value wrapped in % ... %
    expect(params).toMatchObject({ f_0_0_k: 'plan', f_0_0_v: '%pro%' });
  });

  test('filter operators map to the expected SQL operators', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          {
            type: 'event',
            value: 'e',
            filters: [
              { property: 'a', operator: 'eq', value: 'x' },
              { property: 'b', operator: 'neq', value: 'y' },
              { property: 'c', operator: 'dnc', value: 'z' },
            ],
          },
          { type: 'event', value: 'f' },
        ],
      },
      {},
    );

    const [query, params] = prismaRawQuery.mock.calls[0];
    // eq -> '=' with raw value
    expect(query).toContain('= {{f_0_0_v}}');
    expect(params).toMatchObject({ f_0_0_v: 'x' });
    // neq -> '!=' with raw value
    expect(query).toContain('!= {{f_0_1_v}}');
    expect(params).toMatchObject({ f_0_1_v: 'y' });
    // dnc -> 'not ilike' with wrapped value
    expect(query).toContain('not ilike {{f_0_2_v}}');
    expect(params).toMatchObject({ f_0_2_v: '%z%' });
  });

  test('formatResults computes dropoff / remaining relative to first step', async () => {
    prismaRawQuery.mockResolvedValue([{ count: 100 }, { count: 40 }]);

    const result = await getFunnel('website-1', baseParameters, {});

    expect(result[0]).toMatchObject({ visitors: 100, previous: 0, dropped: 0, remaining: 1 });
    expect(result[1]).toMatchObject({
      visitors: 40,
      previous: 100,
      dropped: 60,
      remaining: 0.4,
    });
    expect(result[1].dropoff).toBeCloseTo(0.6);
  });
});

describe('getFunnel clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('builds level0 base CTE, step filter predicate and UNION ALL sum query', async () => {
    await getFunnel('website-1', baseParameters, {});

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(1);
    expect(prismaRawQuery).not.toHaveBeenCalled();
    const [query, params] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('WITH level0 AS');
    expect(query).toContain('level1 AS');
    expect(query).toContain(', level2 AS');
    expect(query).toContain('union all ');
    expect(query).toContain('and website_id = {websiteId:UUID}');
    // step filter predicate uses param0/param1
    expect(query).toContain('url_path = {param0:String}');
    expect(query).toContain('y.url_path = {param1:String}');
    // window interval expressed inline
    expect(query).toContain('x.created_at + interval 30 minute');
    expect(params).toMatchObject({ param0: '/home', param1: '/checkout', websiteId: 'website-1' });
  });

  test('wildcard values switch to LIKE with % substitution', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          { type: 'path', value: '/a/*' },
          { type: 'path', value: '/b' },
        ],
      },
      {},
    );

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('url_path like {param0:String}');
    expect(params).toMatchObject({ param0: '/a/%', param1: '/b' });
  });

  test('event data filters emit event_id IN subqueries with typed params', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          {
            type: 'event',
            value: 'purchase',
            filters: [{ property: 'plan', operator: 'c', value: 'pro' }],
          },
          { type: 'event', value: 'confirm' },
        ],
      },
      {},
    );

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    // first step uses level0 alias for event_id
    expect(query).toContain('and level0.event_id in (');
    expect(query).toContain('data_key = {f_0_0_k:String}');
    expect(query).toContain('like {f_0_0_v:String}');
    expect(params).toMatchObject({ f_0_0_k: 'plan', f_0_0_v: '%pro%' });
  });
});
