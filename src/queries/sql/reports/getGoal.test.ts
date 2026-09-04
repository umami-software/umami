import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getGoal } from './getGoal';

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
  filterQuery: 'and website_event.event_type = {{eventType}}',
  dateQuery: 'and website_event.created_at between {{startDate}} and {{endDate}}',
  joinSessionQuery: 'join session on session.session_id = website_event.session_id',
  cohortQuery: 'join cohort on cohort.session_id = website_event.session_id',
};

const baseParameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  type: 'path',
  value: '/checkout',
};

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();

  // mirror the real parseFilters' pass-through of the caller-supplied `value`
  // into queryParams, so tests observe the converted param produced by getGoal.ts
  prismaParseFilters.mockImplementation((filters: Record<string, any>) => ({
    ...parseFiltersResult,
    queryParams: { ...parseFiltersResult.queryParams, value: filters.value },
  }));
  clickhouseParseFilters.mockImplementation((filters: Record<string, any>) => ({
    ...parseFiltersResult,
    queryParams: { ...parseFiltersResult.queryParams, value: filters.value },
  }));
  prismaRawQuery.mockResolvedValue([{ num: 10, total: 100 }]);
  clickhouseRawQuery.mockResolvedValue([{ num: 10, total: 100 }]);
});

describe('getGoal postgres branch', () => {
  test('a mid-string * is literal and keeps equality', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/blog/*/comments' }, {});

    expect(prismaRawQuery).toHaveBeenCalledTimes(1);
    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and url_path = {{value}}');
    expect(params).toMatchObject({ value: '/blog/*/comments' });
  });

  test('a value with no wildcard keeps equality and passes through untouched, including a literal %', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/sale/100%' }, {});

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and url_path = {{value}}');
    expect(params).toMatchObject({ value: '/sale/100%' });
  });
});

describe('getGoal clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('a mid-string * is literal and keeps equality', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/blog/*/comments' }, {});

    expect(clickhouseRawQuery).toHaveBeenCalledTimes(1);
    expect(prismaRawQuery).not.toHaveBeenCalled();
    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('and url_path = {value:String}');
    expect(params).toMatchObject({ value: '/blog/*/comments' });
  });

  test('a value with no wildcard keeps equality and passes through untouched, including a literal %', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/sale/100%' }, {});

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('and url_path = {value:String}');
    expect(params).toMatchObject({ value: '/sale/100%' });
  });
});
