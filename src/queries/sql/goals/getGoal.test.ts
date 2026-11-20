import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getGoal, getGoalBreakdown, getGoalSummary } from './getGoal';

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
  default: { rawQuery: prismaRawQuery, parseFilters: prismaParseFilters },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: { rawQuery: clickhouseRawQuery, parseFilters: clickhouseParseFilters },
}));

const parseFiltersResult = {
  queryParams: { websiteId: 'website-1' },
  filterQuery: '',
  dateQuery: '',
  joinSessionQuery: '',
  cohortQuery: '',
};

const baseParameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  type: 'path',
};

beforeEach(() => {
  prismaRawQuery.mockReset().mockResolvedValue([{ num: 1, total: 2 }]);
  clickhouseRawQuery.mockReset().mockResolvedValue([{ num: 1, total: 2 }]);
  prismaParseFilters.mockReset().mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReset().mockReturnValue(parseFiltersResult);
});

describe.each([
  ['prisma', prismaRawQuery, prismaParseFilters, '{{value}}'],
  ['clickhouse', clickhouseRawQuery, clickhouseParseFilters, '{value:String}'],
] as const)('getGoal %s branch', (mode, rawQuery, parseFilters, param) => {
  beforeEach(() => {
    state.mode = mode;
  });

  test('values without * match exactly', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/my_page' }, {});

    expect(rawQuery.mock.calls[0][0]).toContain(`and url_path = ${param}`);
    expect(parseFilters).toHaveBeenCalledWith(expect.objectContaining({ value: '/my_page' }));
  });

  test('trailing * keeps its existing LIKE pattern', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/blog/*' }, {});

    expect(rawQuery.mock.calls[0][0]).toContain(`and url_path like ${param}`);
    expect(parseFilters).toHaveBeenCalledWith(expect.objectContaining({ value: '/blog/%' }));
  });

  // An inner * used to fall through to `=` and silently match nothing.
  test('inner * matches as a wildcard with literal _', async () => {
    await getGoal('website-1', { ...baseParameters, value: '/blog/*/my_edit' }, {});

    expect(rawQuery.mock.calls[0][0]).toContain(`and url_path like ${param}`);
    expect(parseFilters).toHaveBeenCalledWith(
      expect.objectContaining({ value: '/blog/%/my\\_edit' }),
    );
  });
});

describe.each([
  ['prisma', prismaRawQuery],
  ['clickhouse', clickhouseRawQuery],
] as const)('goal views %s branch', (mode, rawQuery) => {
  beforeEach(() => {
    state.mode = mode;
  });

  // Every view reads the same goal_events CTE, so it can't disagree with the normal view's count.
  test('views share the goal match used by the stats query', async () => {
    rawQuery.mockResolvedValue([{ completions: 0, median: 0, sessions: 0 }]);

    await getGoalSummary('website-1', { ...baseParameters, value: '/my_page' }, {});

    expect(rawQuery.mock.calls[0][0]).toContain('goal_events AS');
    expect(rawQuery.mock.calls[0][0]).toMatch(/and url_path = \{\{?value/);
  });

  // With no converted sessions there is no time to convert, which differs from 0 seconds.
  test('summary has no median when nobody converted', async () => {
    rawQuery.mockResolvedValue([{ completions: '0', median: 0, sessions: '0' }]);

    await expect(
      getGoalSummary('website-1', { ...baseParameters, value: '/my_page' }, {}),
    ).resolves.toEqual({ completions: 0, median: null });
  });

  test('breakdown sorts by visitors and parses counts', async () => {
    rawQuery.mockResolvedValue([
      { name: 'mobile', visitors: '10', converted: '1' },
      { name: 'desktop', visitors: '20', converted: '5' },
    ]);

    await expect(
      getGoalBreakdown('website-1', { ...baseParameters, value: '/x', field: 'device' }, {}),
    ).resolves.toEqual([
      { name: 'desktop', visitors: 20, converted: 5 },
      { name: 'mobile', visitors: 10, converted: 1 },
    ]);
  });

  // The field is interpolated into SQL, so anything outside the allow list must never reach it.
  test('breakdown rejects unsupported fields before running SQL', async () => {
    await expect(
      getGoalBreakdown('website-1', { ...baseParameters, value: '/x', field: 'url_path' }, {}),
    ).rejects.toThrow('Unsupported goal breakdown field');
    expect(rawQuery).not.toHaveBeenCalled();
  });
});
