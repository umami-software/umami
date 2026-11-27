import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getValues } from './getValues';

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
    getSearchSQL: (column: string, param = 'search') => `and ${column} ilike {{${param}}}`,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQuery,
    parseFilters: clickhouseParseFilters,
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
  prismaParseFilters.mockReset().mockReturnValue({
    joinSessionQuery: '',
    filterQuery: '',
    queryParams: {},
  });
  clickhouseRawQuery.mockReset().mockResolvedValue([]);
  clickhouseParseFilters.mockReset().mockReturnValue({
    filterQuery: '',
    queryParams: {},
  });
});

// ClickHouse does a literal case-insensitive substring match; Postgres must return the same rows.
describe('getValues postgres branch', () => {
  beforeEach(() => {
    state.mode = 'prisma';
  });

  test('single search term is a literal substring match', async () => {
    await getValues('website-1', 'url_path', { ...filters, search: 'my_page%' });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('and website_event.url_path ilike {{search}}');
    expect(params.search).toBe('%my\\_page\\%%');
  });

  // Filter dropdowns load their initial choices with no search term.
  test.each(['url_path', 'browser'])('loads %s choices without a search term', async column => {
    await expect(getValues('website-1', column, filters)).resolves.toEqual([]);

    expect(prismaRawQuery.mock.calls[0][1].search).toBe('%%');
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

  test('applies lockedFilters and qualifies columns for website_event columns', async () => {
    const lockedFilters = {
      filters: { path: 'c./blog', country: 'eq.US' },
      match: 'all' as const,
    };
    prismaParseFilters.mockReturnValue({
      joinSessionQuery:
        'inner join session on website_event.session_id = session.session_id and website_event.website_id = session.website_id',
      filterQuery:
        'and website_event.url_path ilike {{locked_path}}\nand session.country in ({{locked_country}})',
      queryParams: { locked_path: '%/blog%', locked_country: ['US'] },
    });

    await getValues('website-1', 'url_path', {
      ...filters,
      timezone: 'UTC',
      search: 'pricing',
      lockedFilters,
    });

    expect(prismaParseFilters).toHaveBeenCalledWith({
      lockedFilters,
      startDate: filters.startDate,
      endDate: filters.endDate,
      timezone: 'UTC',
    });
    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('select website_event.url_path as "value", count(*) as "count"');
    expect(query).toContain('inner join session on website_event.session_id = session.session_id');
    expect(query).toContain('and website_event.url_path ilike {{search}}');
    expect(query).toContain('and website_event.url_path ilike {{locked_path}}');
    expect(query).toContain('and session.country in ({{locked_country}})');
    expect(params).toMatchObject({
      websiteId: 'website-1',
      search: '%pricing%',
      locked_path: '%/blog%',
      locked_country: ['US'],
    });
  });

  test('scopes session column values via website_event subquery when lockedFilters are present', async () => {
    const lockedFilters = {
      filters: { path: 'c./blog', country: 'eq.US' },
      match: 'all' as const,
    };
    prismaParseFilters.mockReturnValue({
      joinSessionQuery:
        'inner join session on website_event.session_id = session.session_id and website_event.website_id = session.website_id',
      filterQuery:
        'and website_event.url_path ilike {{locked_path}}\nand session.country in ({{locked_country}})',
      queryParams: { locked_path: '%/blog%', locked_country: ['US'] },
    });

    await getValues('website-1', 'browser', {
      ...filters,
      lockedFilters,
    });

    const [query, params] = prismaRawQuery.mock.calls[0];
    expect(query).toContain('from session');
    expect(query).toContain(
      'and session.session_id in (select website_event.session_id from website_event inner join session on website_event.session_id = session.session_id and website_event.website_id = session.website_id where website_event.website_id = {{websiteId::uuid}} and website_event.created_at between {{startDate}} and {{endDate}}',
    );
    expect(query).toContain('{{locked_path}}');
    expect(query).toContain('{{locked_country}}');
    expect(params).toMatchObject({
      websiteId: 'website-1',
      locked_path: '%/blog%',
      locked_country: ['US'],
    });
  });

  test('omits session subquery when lockedFilters are absent', async () => {
    await getValues('website-1', 'browser', filters);

    expect(prismaParseFilters).not.toHaveBeenCalled();
    expect(prismaRawQuery.mock.calls[0][0]).not.toContain('session.session_id in');
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

  test('applies lockedFilters in ClickHouse', async () => {
    const lockedFilters = {
      filters: { path: 'c./blog', country: 'eq.US' },
      match: 'all' as const,
    };
    clickhouseParseFilters.mockReturnValue({
      filterQuery:
        'and positionCaseInsensitive(url_path, {locked_path:String}) > 0\nand country IN {locked_country:Array(String)}',
      queryParams: { locked_path: '/blog', locked_country: ['US'] },
    });

    await getValues('website-1', 'url_path', {
      ...filters,
      timezone: 'UTC',
      lockedFilters,
    });

    expect(clickhouseParseFilters).toHaveBeenCalledWith({
      lockedFilters,
      startDate: filters.startDate,
      endDate: filters.endDate,
      timezone: 'UTC',
    });
    const [query, params] = clickhouseRawQuery.mock.calls[0];
    expect(query).toContain('positionCaseInsensitive(url_path, {locked_path:String}) > 0');
    expect(query).toContain('country IN {locked_country:Array(String)}');
    expect(params).toMatchObject({
      websiteId: 'website-1',
      locked_path: '/blog',
      locked_country: ['US'],
    });
  });
});
