import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getFunnel, getFunnelBreakdown, getFunnelChart, getFunnelTimes } from './getFunnel';

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
    getDateSQL: (field: string, unit: string) => `pg_date(${field}, ${unit})`,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQuery,
    parseFilters: clickhouseParseFilters,
    getDateSQL: (field: string, unit: string) => `ch_date(${field}, ${unit})`,
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
  test('emits an explicit report start bound for every subsequent step', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: Array.from({ length: 8 }, (_, i) => ({ type: 'path', value: `/step-${i}` })),
      },
      {},
    );

    const [query] = prismaRawQuery.mock.calls[0];
    const subsequentLevels = query.split(/,\s*level\d+ AS \(/).slice(1);
    expect(subsequentLevels).toHaveLength(7);
    for (const level of subsequentLevels) {
      expect(level.match(/and we\.created_at >= \{\{startDate}}/g)).toHaveLength(1);
    }
  });

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

  // An inner * used to fall through to `=` and silently match nothing.
  test('inner wildcards match as LIKE and % / _ stay literal', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          { type: 'path', value: '/blog/*/edit' },
          { type: 'path', value: '/my_page' },
        ],
      },
      {},
    );

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and url_path like {{0}}');
    expect(query).toContain('and we.url_path = {{1}}');
    expect(params).toMatchObject({ 0: '/blog/%/edit', 1: '/my_page' });
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

  test('inner wildcards match as LIKE with literal % and _ escaped', async () => {
    await getFunnel(
      'website-1',
      {
        ...baseParameters,
        steps: [
          { type: 'path', value: '/docs/*/v2_*' },
          { type: 'path', value: '/b' },
        ],
      },
      {},
    );

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('url_path like {param0:String}');
    expect(params).toMatchObject({ param0: '/docs/%/v2\\_%', param1: '/b' });
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

describe.each([
  ['prisma', prismaRawQuery, 'pg_date'],
  ['clickhouse', clickhouseRawQuery, 'ch_date'],
] as const)('getFunnelChart %s branch', (mode, rawQuery, dateFn) => {
  beforeEach(() => {
    state.mode = mode;
  });

  // Each session counts once, by first entry, so buckets add up to the first and last steps.
  test('buckets sessions by first entry and counts those that reached the last step', async () => {
    rawQuery.mockResolvedValue([{ t: '2026-05-18', entered: '10', converted: '3' }]);

    const result = await getFunnelChart('website-1', { ...baseParameters, unit: 'day' }, {});
    const [query] = rawQuery.mock.calls[0];

    expect(query).toContain('min(created_at) as first_at\n      from level1');
    expect(query).toContain(`${dateFn}(first_at, day) as t`);
    expect(query).toContain('session_id in (select session_id from level2)');
    expect(result).toEqual([{ t: '2026-05-18', entered: 10, converted: 3 }]);
  });
});

describe.each([
  ['prisma', prismaRawQuery, 'percentile_disc(0.5)'],
  ['clickhouse', clickhouseRawQuery, 'quantileExactLow(0.5)'],
] as const)('getFunnelTimes %s branch', (mode, rawQuery, median) => {
  beforeEach(() => {
    state.mode = mode;
  });

  // Each step is timed from the previous one; level 0 is the whole funnel.
  test('measures each step from the previous one and the funnel from first to last', async () => {
    rawQuery.mockResolvedValue([
      { level: 2, sessions: 5, median: 42 },
      { level: 0, sessions: 0, median: 0 },
    ]);

    const result = await getFunnelTimes('website-1', baseParameters, {});
    const [query] = rawQuery.mock.calls[0];

    expect(query).toContain(median);
    expect(query).toMatch(/select 2 as level,[\s\S]*from reached2 b\s+join reached1 a/);
    expect(query).toMatch(/select 0 as level,[\s\S]*from reached2 b\s+join reached1 a/);
    // No sessions means no median, not a median of 0.
    expect(result).toEqual({ total: null, steps: [null, 42] });
  });
});

describe('getFunnelBreakdown', () => {
  // The column is interpolated into SQL, so only allowed attributes may reach the query.
  test('rejects fields outside the allowed session attributes without querying', async () => {
    await expect(
      getFunnelBreakdown('website-1', { ...baseParameters, field: 'url_path' }, {}),
    ).rejects.toThrow('Unsupported funnel breakdown field');
    expect(prismaRawQuery).not.toHaveBeenCalled();
  });

  test('postgres reads the attribute from the session row', async () => {
    prismaRawQuery.mockResolvedValue([
      { level: 1, name: 'mobile', count: 10 },
      { level: 2, name: 'mobile', count: 4 },
      { level: 1, name: 'desktop', count: 20 },
    ]);

    const result = await getFunnelBreakdown(
      'website-1',
      { ...baseParameters, field: 'device' },
      {},
    );
    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain("coalesce(session.device, '') as name");
    // Sorted by first-step visitors; steps a value never reached count as 0.
    expect(result).toEqual([
      { name: 'desktop', visitors: [20, 0] },
      { name: 'mobile', visitors: [10, 4] },
    ]);
  });

  // Attributes can change within a session, so ClickHouse takes the first event's value.
  test('clickhouse takes the value from the session first event', async () => {
    state.mode = 'clickhouse';
    clickhouseRawQuery.mockResolvedValue([]);

    await getFunnelBreakdown('website-1', { ...baseParameters, field: 'device' }, {});
    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('argMin(device, created_at) as name');
  });
});
