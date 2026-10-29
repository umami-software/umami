import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getValues } from './getValues';

const {
  state,
  prismaRawQuery,
  clickhouseRawQuery,
} = vi.hoisted(() => ({
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

const startDate = new Date('2026-05-18T00:00:00.000Z');
const endDate = new Date('2026-05-19T00:00:00.000Z');

beforeEach(() => {
  state.mode = 'prisma';
  prismaRawQuery.mockReset();
  clickhouseRawQuery.mockReset();
  prismaRawQuery.mockResolvedValue([]);
  clickhouseRawQuery.mockResolvedValue([]);
});

describe('getValues postgres branch', () => {
  test('escapes search metacharacters and wraps the substring in wildcards', async () => {
    await getValues('website-1', 'url_path', { startDate, endDate, search: '50%' });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain("and url_path ilike {{search}} escape '\\'");
    // '%' is escaped, then the whole value is wrapped with % ... %
    expect(params.search).toBe('%50\\%%');
  });

  test('escapes underscores and backslashes too', async () => {
    await getValues('website-1', 'url_path', { startDate, endDate, search: 'a_b\\c' });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain("and url_path ilike {{search}} escape '\\'");
    expect(params.search).toBe('%a\\_b\\\\c%');
  });

  test('multi-term search escapes every term and adds the escape clause', async () => {
    // %25 decodes to '%', so the decoded search '50%,foo' contains a comma
    await getValues('website-1', 'url_path', {
      startDate,
      endDate,
      search: '50%25,foo',
    });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain("url_path ilike {{search0}} escape '\\'");
    expect(query).toContain("url_path ilike {{search1}} escape '\\'");
    expect(params).toMatchObject({ search0: '50\\%', search1: 'foo' });
  });
});

describe('getValues clickhouse branch', () => {
  beforeEach(() => {
    state.mode = 'clickhouse';
  });

  test('uses a literal substring search, so metacharacters are not wildcards', async () => {
    await getValues('website-1', 'url_path', { startDate, endDate, search: '50%' });

    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('positionCaseInsensitive(url_path, {search:String}) > 0');
    expect(params.search).toBe('50%');
  });
});
