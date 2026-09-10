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
  const mod = await import('./prisma');
  getRawQueryClient = mod.getRawQueryClient;
  prisma = mod.default;
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

describe('wildcard filters (postgres)', () => {
  test('matches operator emits ilike against the column', () => {
    const sql = prisma.getFilterQuery({
      path: { name: 'path', operator: 'wc', value: '/blog/*' },
    });

    expect(sql).toContain('and website_event.url_path ilike {{path}}');
  });

  test('doesNotMatch operator emits not ilike', () => {
    const sql = prisma.getFilterQuery({
      path: { name: 'path', operator: 'nwc', value: '/admin/*' },
    });

    expect(sql).toContain('and website_event.url_path not ilike {{path}}');
  });

  test('a mid-string * is escaped, not translated', () => {
    const { queryParams } = prisma.parseFilters({
      path: { name: 'path', operator: 'wc', value: '/blog/*/comments' },
    });

    expect(queryParams.path).toBe('/blog/*/comments');
  });

  test('user-typed LIKE metacharacters are escaped', () => {
    const { queryParams } = prisma.parseFilters({
      path: { name: 'path', operator: 'wc', value: '/sale/100%*' },
    });

    expect(queryParams.path).toBe('/sale/100\\%%');
  });

  // one assertion per property-filter builder, because the string branch is
  // duplicated three times in prisma.ts and it is easy to patch only one copy
  test('getEventPropertyFilterQuery supports wildcards', () => {
    const { filterQuery, queryParams } = prisma.parseFilters({
      eventPropertyFilters: [
        { propertyName: 'file', dataType: 1, operator: 'wc', value: 'liberica-*' },
      ],
    });

    expect(filterQuery).toContain('string_value ilike');
    expect(Object.values(queryParams)).toContain('liberica-%');
  });

  test('getSessionPropertyFilterQuery supports wildcards', () => {
    const { filterQuery, queryParams } = prisma.parseFilters({
      sessionPropertyFilters: [
        { propertyName: 'plan', dataType: 1, operator: 'nwc', value: 'trial-*' },
      ],
    });

    expect(filterQuery).toContain('string_value not ilike');
    expect(Object.values(queryParams)).toContain('trial-%');
  });

  test('getPropertyFilterQuery supports wildcards', () => {
    const { sql, params } = prisma.getPropertyFilterQuery(
      [{ propertyName: 'file', dataType: 1, operator: 'wc', value: 'liberica-*' }],
      'event',
    );

    expect(sql).toContain('string_value ilike');
    expect(Object.values(params)).toContain('liberica-%');
  });
});
