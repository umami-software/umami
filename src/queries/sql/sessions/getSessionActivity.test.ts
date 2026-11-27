import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://user:pass@localhost:5432/umami?schema=public';
delete process.env.DATABASE_REPLICA_URL;

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class PrismaPg {},
}));

vi.mock('@prisma/extension-read-replicas', () => ({
  readReplicas: () => () => ({}),
}));

vi.mock('@/generated/prisma/client', () => ({
  PrismaClient: class PrismaClient {
    $executeRawUnsafe = vi.fn();
    $queryRawUnsafe = vi.fn();
    $transaction = vi.fn();
    $on = vi.fn();
    $extends() {
      return this;
    }
  },
}));

let clickhouse!: typeof import('@/lib/clickhouse').default;
let prisma!: typeof import('@/lib/prisma').default;
let getSessionActivity!: typeof import('./getSessionActivity').getSessionActivity;

beforeAll(async () => {
  ({ default: clickhouse } = await import('@/lib/clickhouse'));
  ({ default: prisma } = await import('@/lib/prisma'));
  ({ getSessionActivity } = await import('./getSessionActivity'));
});

afterEach(() => {
  delete process.env.CLICKHOUSE_URL;
  vi.restoreAllMocks();
});

describe('getSessionActivity lockedFilters', () => {
  const startDate = new Date('2026-07-01T00:00:00.000Z');
  const endDate = new Date('2026-07-31T23:59:59.999Z');
  const sessionIds = ['session-1', 'session-2'];

  test('applies lockedFilters and qualifies website_event columns in Postgres', async () => {
    delete process.env.CLICKHOUSE_URL;
    const rawQuerySpy = vi.spyOn(prisma, 'rawQuery').mockResolvedValue([]);

    await getSessionActivity('website-1', sessionIds, {
      startDate,
      endDate,
      lockedFilters: {
        filters: {
          path: 'c./blog',
          country: 'eq.US',
        },
        match: 'all',
      },
    });

    expect(rawQuerySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = rawQuerySpy.mock.calls[0];
    expect(sql).not.toContain('from website_event e');
    expect(sql).toContain('d.website_event_id = website_event.event_id');
    expect(sql).toContain('inner join session on website_event.session_id = session.session_id');
    expect(sql).toContain('where website_event.website_id = {{websiteId::uuid}}');
    expect(sql).toContain('and website_event.session_id = any({{sessionIds}}::uuid[])');
    expect(sql).toContain('{{locked_path}}');
    expect(sql).toContain('{{locked_country}}');
    expect(params).toMatchObject({
      websiteId: 'website-1',
      sessionIds,
      startDate,
      endDate,
      locked_path: '%/blog%',
      locked_country: ['US'],
    });
  });

  test('omits session join when lockedFilters are absent in Postgres', async () => {
    delete process.env.CLICKHOUSE_URL;
    const rawQuerySpy = vi.spyOn(prisma, 'rawQuery').mockResolvedValue([]);

    await getSessionActivity('website-1', sessionIds, {
      startDate,
      endDate,
    });

    expect(rawQuerySpy).toHaveBeenCalledTimes(1);
    const [sql] = rawQuerySpy.mock.calls[0];
    expect(sql).not.toContain('inner join session');
  });

  test('applies lockedFilters in ClickHouse', async () => {
    process.env.CLICKHOUSE_URL = 'http://localhost:8123';
    const rawQuerySpy = vi.spyOn(clickhouse, 'rawQuery').mockResolvedValue([]);

    await getSessionActivity('website-1', sessionIds, {
      startDate,
      endDate,
      lockedFilters: {
        filters: {
          path: 'c./blog',
          country: 'eq.US',
        },
        match: 'all',
      },
    });

    expect(rawQuerySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = rawQuerySpy.mock.calls[0];
    expect(sql).toContain('from website_event');
    expect(sql).toContain('positionCaseInsensitive(url_path, {locked_path:String}) > 0');
    expect(sql).toContain('country IN {locked_country:Array(String)}');
    expect(params).toMatchObject({
      websiteId: 'website-1',
      sessionIds,
      startDate,
      endDate,
      locked_path: '/blog',
      locked_country: ['US'],
    });
  });
});
