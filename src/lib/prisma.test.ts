import { beforeAll, describe, expect, test, vi } from 'vitest';

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

let getRawQueryClient!: typeof import('./prisma').getRawQueryClient;
let prisma!: typeof import('./prisma').default;

beforeAll(async () => {
  ({ getRawQueryClient, default: prisma } = await import('./prisma'));
});

interface RawQueryClient {
  $executeRawUnsafe: (query: string, ...params: any[]) => unknown;
  $queryRawUnsafe: (query: string, ...params: any[]) => unknown;
  $primary?: () => unknown;
  $replica?: () => unknown;
}

function createClient(): RawQueryClient {
  return {
    $executeRawUnsafe: vi.fn(),
    $queryRawUnsafe: vi.fn(),
  };
}

describe('getRawQueryClient', () => {
  test('uses a replica client for read queries when replicas are enabled', () => {
    const replica = createClient();
    const client = {
      ...createClient(),
      $replica: vi.fn(() => replica),
    };

    expect(getRawQueryClient(client, { useReplica: true })).toBe(replica);
  });

  test('keeps read queries on the primary client when replicas are disabled', () => {
    const client = {
      ...createClient(),
      $replica: vi.fn(() => createClient()),
    };

    expect(getRawQueryClient(client, { useReplica: false })).toBe(client);
  });

  test('uses the primary client for raw writes when available', () => {
    const primary = createClient();
    const client = {
      ...createClient(),
      $primary: vi.fn(() => primary),
      $replica: vi.fn(() => createClient()),
    };

    expect(getRawQueryClient(client, { useReplica: true, write: true })).toBe(primary);
  });

  test('falls back to the current client for raw writes without a primary helper', () => {
    const client = createClient();

    expect(getRawQueryClient(client, { write: true })).toBe(client);
  });
});

describe('getDateSQL timezone formatting', () => {
  test('formats UTC (default) buckets with an explicit zone and a Z marker', () => {
    // Never rely on the DB session's ambient timezone.
    expect(prisma.getDateSQL('website_event.created_at', 'hour')).toBe(
      `to_char(date_trunc('hour', website_event.created_at at time zone 'UTC'), 'YYYY-MM-DD"T"HH24:00:00"Z"')`,
    );
    expect(prisma.getDateSQL('website_event.created_at', 'hour', 'UTC')).toBe(
      `to_char(date_trunc('hour', website_event.created_at at time zone 'UTC'), 'YYYY-MM-DD"T"HH24:00:00"Z"')`,
    );
  });

  test('formats non-UTC buckets with the same explicit Z marker, not a bare timestamp', () => {
    // Bare timestamps get misparsed as local-to-the-runtime, not the source zone.
    expect(prisma.getDateSQL('website_event.created_at', 'hour', 'Asia/Tehran')).toBe(
      `to_char(date_trunc('hour', website_event.created_at at time zone 'Asia/Tehran'), 'YYYY-MM-DD"T"HH24:00:00"Z"')`,
    );
  });
});

describe('getDateStringSQL timezone formatting', () => {
  test('formats non-UTC second-precision values with an explicit Z marker', () => {
    expect(prisma.getDateStringSQL('event_data.date_value', 'second', 'Asia/Tehran')).toBe(
      `to_char(event_data.date_value at time zone 'Asia/Tehran', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
    );
  });

  test('defaults to explicit UTC formatting regardless of unit when no timezone is given', () => {
    expect(prisma.getDateStringSQL('event_data.date_value')).toBe(
      `to_char(event_data.date_value at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`,
    );
  });
});

describe('getFilterQuery null handling', () => {
  // ClickHouse stores a missing value as '', so negative filters must keep those rows on
  // PostgreSQL too, e.g. "does not match .+" finds sessions without a distinct ID (#4596).
  test.each([
    ['not equals', 'neq.user-1', "coalesce(session.distinct_id, '') != ALL({{distinctId}})"],
    ['does not contain', 'dnc.user', "coalesce(session.distinct_id, '') not ilike {{distinctId}}"],
    ['does not match regex', 'nre..+', "coalesce(session.distinct_id, '') !~* {{distinctId}}"],
  ])('treats a missing value as an empty string for %s', (_label, value, clause) => {
    expect(prisma.getFilterQuery({ distinctId: value })).toContain(`and ${clause}`);
  });

  test('keeps positive filters on the bare column so they can use indexes', () => {
    expect(prisma.getFilterQuery({ country: 'US' })).toContain(
      'and session.country = ANY({{country}})',
    );
  });
});

describe('getDateWeeklySQL timezone formatting', () => {
  test('falls back to UTC instead of producing invalid SQL when no timezone is given', () => {
    // Regression test: this used to interpolate `undefined` straight into `at time zone`.
    expect(prisma.getDateWeeklySQL('website_event.created_at')).toBe(
      `concat(extract(dow from (website_event.created_at at time zone 'UTC')), ':', to_char((website_event.created_at at time zone 'UTC'), 'HH24'))`,
    );
  });

  test('uses the given timezone when one is provided', () => {
    expect(prisma.getDateWeeklySQL('website_event.created_at', 'Asia/Tehran')).toBe(
      `concat(extract(dow from (website_event.created_at at time zone 'Asia/Tehran')), ':', to_char((website_event.created_at at time zone 'Asia/Tehran'), 'HH24'))`,
    );
  });
});

describe('pagedRawQuery default ordering', () => {
  function mockQueries(count = '4') {
    const queryRaw = vi.mocked((prisma.client as any).$queryRawUnsafe);
    queryRaw.mockClear();
    queryRaw.mockImplementation(async (sql: string) =>
      sql.includes('count(*) as num') ? [{ num: count }] : [{ id: 1 }],
    );
    return queryRaw;
  }

  test.each([undefined, 5])(
    'applies trusted default order only to the page query with cap %s',
    async maxResults => {
      const queryRaw = mockQueries('5');
      const result = await prisma.pagedRawQuery(
        'select * from thing',
        {},
        { page: 2, pageSize: 2, maxResults },
        'test',
        'max(created_at) desc, session_id',
      );

      expect(queryRaw).toHaveBeenCalledTimes(2);
      expect(queryRaw.mock.calls[0][0]).not.toContain('order by max(created_at) desc');
      expect(queryRaw.mock.calls[1][0]).toContain('order by max(created_at) desc, session_id');
      expect(queryRaw.mock.calls[1][0]).toContain('limit 2 offset 2');
      expect(result).toEqual({
        data: [{ id: 1 }],
        count: 5,
        page: 2,
        pageSize: 2,
        isCapped: !!maxResults,
        orderBy: undefined,
      });
    },
  );

  test('keeps explicit ordering and legacy no-order behavior', async () => {
    const queryRaw = mockQueries();
    const result = await prisma.pagedRawQuery(
      'select * from thing',
      {},
      { page: 1, pageSize: 2, orderBy: 'name', sortDescending: true },
      undefined,
      'max(created_at) desc, session_id',
    );
    expect(queryRaw.mock.calls[1][0]).toContain('order by name desc');
    expect(queryRaw.mock.calls[1][0]).not.toContain('order by max(created_at) desc, session_id');
    expect(result.orderBy).toBe('name');
    queryRaw.mockClear();
    await prisma.pagedRawQuery('select * from thing', {}, { page: 1, pageSize: 2 });
    expect(queryRaw.mock.calls[1][0]).not.toMatch(/order by/);
  });
});

describe('paged query concurrency', () => {
  test('pagedRawQuery issues the page query while the count query is still pending', async () => {
    const queryRaw = vi.mocked((prisma.client as any).$queryRawUnsafe);
    queryRaw.mockClear();

    let releaseCount!: (rows: unknown) => void;
    const countGate = new Promise(resolve => {
      releaseCount = resolve;
    });

    queryRaw.mockImplementation((sql: string) =>
      sql.includes('count(*) as num') ? countGate : Promise.resolve([{ id: 1 }]),
    );

    const pending = prisma.pagedRawQuery('select * from thing', {}, { page: 1, pageSize: 2 });

    // With sequential awaits the page query cannot be issued until the count
    // resolves, so this times out; with concurrent execution both queries are
    // in flight immediately.
    await vi.waitFor(() => expect(queryRaw).toHaveBeenCalledTimes(2));

    releaseCount([{ num: '3' }]);

    const result = await pending;

    expect(result.count).toBe(3);
    expect(result.data).toEqual([{ id: 1 }]);
  });

  test('pagedQuery issues the count while findMany is still pending', async () => {
    let releaseData!: (rows: unknown[]) => void;
    const dataGate = new Promise<unknown[]>(resolve => {
      releaseData = resolve;
    });

    const findMany = vi.fn(() => dataGate);
    const count = vi.fn(async () => 7);

    (prisma.client as any).thing = { findMany, count };

    try {
      const pending = prisma.pagedQuery('thing', { where: {} }, { page: 1, pageSize: 2 });

      await vi.waitFor(() => expect(count).toHaveBeenCalledTimes(1));

      releaseData([{ id: 1 }]);

      const result = await pending;

      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.count).toBe(7);
    } finally {
      delete (prisma.client as any).thing;
    }
  });
});
