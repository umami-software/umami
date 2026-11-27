import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getSessionReplays } from './getSessionReplays';

const { prismaPagedRawQueryMock, clickhousePagedRawQueryMock, parseFiltersMock, db } = vi.hoisted(
  () => ({
    prismaPagedRawQueryMock: vi.fn(),
    clickhousePagedRawQueryMock: vi.fn(),
    parseFiltersMock: vi.fn(),
    db: { current: 'prisma' },
  }),
);

vi.mock('@/lib/prisma', () => ({
  default: { pagedRawQuery: prismaPagedRawQueryMock, parseFilters: parseFiltersMock },
}));
vi.mock('@/lib/clickhouse', () => ({
  default: { pagedRawQuery: clickhousePagedRawQueryMock, parseFilters: parseFiltersMock },
}));
vi.mock('@/lib/db', () => ({
  PRISMA: 'prisma',
  CLICKHOUSE: 'clickhouse',
  runQuery: (queries: Record<string, () => unknown>) => queries[db.current](),
}));

const filters = { startDate: new Date('2026-11-01'), endDate: new Date('2026-11-30') } as any;

describe('getSessionReplays', () => {
  beforeEach(() => {
    db.current = 'prisma';
    prismaPagedRawQueryMock.mockReset().mockResolvedValue({ data: [], count: 0 });
    clickhousePagedRawQueryMock.mockReset().mockResolvedValue({ data: [], count: 0 });
    parseFiltersMock.mockReset().mockReturnValue({
      filterQuery: '',
      cohortQuery: '',
      joinSessionQuery: '',
      queryParams: { websiteId: 'website-1' },
    });
  });

  describe('relational', () => {
    test('selects the first pageview path of the visit as entryPath', async () => {
      await getSessionReplays('website-1', filters);

      const sql: string = prismaPagedRawQueryMock.mock.calls[0][0];

      expect(sql).toContain('as "entryPath"');
      expect(sql).toMatch(/website_event\.visit_id = sr\.visit_id/);
      expect(sql).toMatch(/website_event\.event_type = 1/);
      expect(sql).toMatch(/order by website_event\.created_at asc\s+limit 1/);
    });

    test('scopes the entry page lookup to the replay website', async () => {
      await getSessionReplays('website-1', filters);

      const sql: string = prismaPagedRawQueryMock.mock.calls[0][0];

      expect(sql).toMatch(/website_event\.website_id = sr\.website_id/);
    });
  });

  describe('clickhouse', () => {
    beforeEach(() => {
      db.current = 'clickhouse';
    });

    test('joins the earliest pageview path per visit as entryPath', async () => {
      await getSessionReplays('website-1', filters);

      const sql: string = clickhousePagedRawQueryMock.mock.calls[0][0];

      expect(sql).toContain('argMin(url_path, created_at) as entry_path');
      expect(sql).toMatch(/event_type = 1/);
      expect(sql).toMatch(/left join \(/);
      expect(sql).toMatch(/entry_page\.visit_id = session_replay\.visit_id/);
      expect(sql).toContain('as entryPath');
    });

    test('limits the entry page subquery to the website and date range', async () => {
      await getSessionReplays('website-1', filters);

      const sql: string = clickhousePagedRawQueryMock.mock.calls[0][0];
      const entrySubquery = sql.slice(sql.indexOf('argMin(url_path'), sql.indexOf(') entry_page'));

      expect(entrySubquery).toContain('website_id = {websiteId:UUID}');
      expect(entrySubquery).toContain(
        'created_at between {startDate:DateTime64} and {endDate:DateTime64}',
      );
    });
  });
});
