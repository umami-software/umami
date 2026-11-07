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
