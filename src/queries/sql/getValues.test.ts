import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getValues } from './getValues';

const { state, prismaRawQuery, clickhouseRawQuery } = vi.hoisted(() => ({
  state: { mode: 'prisma' as 'prisma' | 'clickhouse' },
  prismaRawQuery: vi.fn(),
  clickhouseRawQuery: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: prismaRawQuery,
    getSearchSQL: (column: string, param = 'search') => `and ${column} ilike {{${param}}}`,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQuery,
    getSearchSQL: (column: string, param = 'search') =>
      `and positionCaseInsensitive(${column}, {${param}:String}) > 0`,
  },
}));

const filters = {
  startDate: new Date('2026-05-18T00:00:00.000Z'),
  endDate: new Date('2026-05-19T00:00:00.000Z'),
};

beforeEach(() => {
  prismaRawQuery.mockReset().mockResolvedValue([]);
  clickhouseRawQuery.mockReset().mockResolvedValue([]);
});

// ClickHouse does a literal case-insensitive substring match; Postgres must return the same rows.
describe('getValues postgres branch', () => {
  beforeEach(() => {
    state.mode = 'prisma';
  });

  test('single search term is a literal substring match', async () => {
    await getValues('website-1', 'url_path', { ...filters, search: 'my_page%' });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and url_path ilike {{search}}');
    expect(params.search).toBe('%my\\_page\\%%');
  });

  test('plain single search term is unchanged', async () => {
    await getValues('website-1', 'url_path', { ...filters, search: 'blog' });

    expect(prismaRawQuery.mock.calls[0][1].search).toBe('%blog%');
  });

  // search arrives already URL-decoded; decoding it again threw on a lone %.
  test('a lone % is searched literally instead of throwing', async () => {
    await getValues('website-1', 'url_path', { ...filters, search: '50%' });

    expect(prismaRawQuery.mock.calls[0][1].search).toBe('%50\\%%');
  });

  // Multi-term values used to be passed without %, turning substring search into exact match.
  test('multiple search terms are each a literal substring match', async () => {
    await getValues('website-1', 'browser', { ...filters, search: 'chro,fire_' });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('AND (browser ilike {{search0}} OR browser ilike {{search1}})');
    expect(params).toMatchObject({ search0: '%chro%', search1: '%fire\\_%' });
  });
});

describe('getValues clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('search terms are passed through unchanged for positionCaseInsensitive', async () => {
    await getValues('website-1', 'browser', { ...filters, search: 'chro,fire_' });

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('positionCaseInsensitive(browser, {search0:String}) > 0');
    expect(params).toMatchObject({ search0: 'chro', search1: 'fire_' });
  });

  test('a lone % is passed through instead of throwing', async () => {
    await getValues('website-1', 'url_path', { ...filters, search: '50%' });

    expect(clickhouseRawQuery.mock.calls[0][1].search).toBe('50%');
  });
});
