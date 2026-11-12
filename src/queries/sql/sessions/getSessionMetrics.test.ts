import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getSessionMetrics } from './getSessionMetrics';

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
  filterQuery: '',
  joinSessionQuery: '',
  cohortQuery: '',
  excludeBounceQuery: '',
  queryParams: {},
};

beforeEach(() => {
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();

  prismaRawQuery.mockResolvedValue([]);
  clickhouseRawQuery.mockResolvedValue([]);
  prismaParseFilters.mockReturnValue(parseFiltersResult);
  clickhouseParseFilters.mockReturnValue(parseFiltersResult);
});

describe('getSessionMetrics', () => {
  // Rare devices, browsers and OS are real values; folding them into "unknown" hides them from
  // reports, breaks filtering, and diverged between Postgres (NULL) and ClickHouse ('')
  test.each([
    ['prisma', 'device'],
    ['prisma', 'browser'],
    ['prisma', 'os'],
    ['clickhouse', 'device'],
    ['clickhouse', 'browser'],
    ['clickhouse', 'os'],
  ] as const)('groups by the raw %s %s column', async (mode, type) => {
    state.mode = mode;

    await getSessionMetrics('website-id', { type }, {});

    const rawQuery = mode === 'prisma' ? prismaRawQuery : clickhouseRawQuery;
    const [query] = rawQuery.mock.calls[0];

    expect(query).toMatch(new RegExp(`select\\s+${type} x,`));
    expect(query).not.toContain("'unknown'");
  });
});
