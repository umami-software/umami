import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getGoal } from './getGoal';

const {
  state,
  prismaRawQuery,
  prismaParseFilters,
  clickhouseRawQuery,
  clickhouseParseFilters,
} = vi.hoisted(() => ({
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

const baseParameters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
  type: 'event',
  value: 'purchase',
};

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  prismaParseFilters.mockReset();
  clickhouseRawQuery.mockReset();
  clickhouseParseFilters.mockReset();
  // parseFilters echoes the resolved value into queryParams so it is inspectable
  prismaParseFilters.mockImplementation((args) => ({
    queryParams: { websiteId: 'website-1', value: args.value },
    filterQuery: '',
    joinSessionQuery: '',
    cohortQuery: '',
  }));
  clickhouseParseFilters.mockImplementation((args) => ({
    queryParams: { websiteId: 'website-1', value: args.value },
    filterQuery: '',
    cohortQuery: '',
  }));
  prismaRawQuery.mockResolvedValue([{ num: 5, total: 10 }]);
  clickhouseRawQuery.mockResolvedValue([{ num: 5, total: 10 }]);
});

describe('getGoal postgres branch', () => {
  test('uses equality when there is no wildcard', async () => {
    await getGoal('website-1', { ...baseParameters, value: 'purchase' }, {});

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and event_name = {{value}}');
    expect(params.value).toBe('purchase');
  });

  test('translates every * into % and escapes LIKE metacharacters', async () => {
    await getGoal('website-1', { ...baseParameters, value: 'a*b' }, {});

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain("and event_name like {{value}} escape '\\'");
    expect(params.value).toBe('a%b');
  });

  test('literal %, _ and \* are escaped when combined with a wildcard', async () => {
    await getGoal('website-1', { ...baseParameters, value: '50%_*' }, {});

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain("and event_name like {{value}} escape '\\'");
    // escapeLikeValue('50%_*') => '50\\%\\_*', then every * -> %
    expect(params.value).toBe('50\\%\\_%');
  });

  test('path type applies the same handling to url_path', async () => {
    await getGoal('website-1', { ...baseParameters, type: 'path', value: 'x*y' }, {});

    const [query] = prismaRawQuery.mock.calls[0];
    expect(query).toContain("and url_path like {{value}} escape '\\'");
  });
});

describe('getGoal clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('translates every * into % and escapes LIKE metacharacters', async () => {
    await getGoal('website-1', { ...baseParameters, value: 'a*b' }, {});

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('and event_name like {value:String}');
    expect(params.value).toBe('a%b');
  });

  test('literal %, _ and * are escaped when combined with a wildcard', async () => {
    await getGoal('website-1', { ...baseParameters, value: '50%_*' }, {});

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('and event_name like {value:String}');
    expect(params.value).toBe('50\\%\\_%');
  });
});
