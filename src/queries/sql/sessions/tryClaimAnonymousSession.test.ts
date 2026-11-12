import { beforeEach, describe, expect, test, vi } from 'vitest';
import { tryClaimAnonymousSession } from './tryClaimAnonymousSession';

const mocks = vi.hoisted(() => ({
  claims: new Map<string, string>(),
  insert: vi.fn(),
  rawQuery: vi.fn(),
  redis: { enabled: true },
  kafka: { enabled: false, sendMessage: vi.fn() },
}));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: (queries: Record<string, () => unknown>) => queries.clickhouse(),
}));
vi.mock('@/lib/prisma', () => ({ default: {}, getSchema: () => undefined }));
vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: mocks.rawQuery,
    insert: mocks.insert,
    getUTCString: () => '2026-11-11 12:00:00',
  },
}));
vi.mock('@/lib/kafka', () => ({ default: mocks.kafka }));
vi.mock('@/lib/redis', () => ({
  default: {
    get enabled() {
      return mocks.redis.enabled;
    },
    client: {
      connect: async () => undefined,
      client: {
        // Behaves like Redis SET NX: only the first writer wins.
        set: async (key: string, value: string, { NX }: { NX?: boolean }) => {
          if (NX && mocks.claims.has(key)) return null;
          mocks.claims.set(key, value);
          return 'OK';
        },
        get: async (key: string) => mocks.claims.get(key) ?? null,
      },
    },
  },
}));

const args = {
  websiteId: '00000000-0000-4000-8000-000000000001',
  sessionId: '00000000-0000-4000-8000-000000000002',
  createdAt: new Date('2026-11-11T12:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.claims.clear();
  mocks.redis.enabled = true;
  mocks.kafka.enabled = false;
  mocks.rawQuery.mockResolvedValue([]);
});

describe('ClickHouse session claims', () => {
  test('claims an unclaimed session and records the link', async () => {
    await expect(tryClaimAnonymousSession({ ...args, distinctId: 'alice' })).resolves.toBe(true);

    expect(mocks.insert).toHaveBeenCalledWith('session_link', [
      expect.objectContaining({ session_id: args.sessionId, distinct_id: 'alice' }),
    ]);
  });

  // With Kafka the first claim's row has not reached ClickHouse yet, so only the
  // Redis claim stops a second identity from reusing the session.
  test('refuses a second identity before the first claim reaches ClickHouse', async () => {
    mocks.kafka.enabled = true;

    await expect(tryClaimAnonymousSession({ ...args, distinctId: 'alice' })).resolves.toBe(true);
    await expect(tryClaimAnonymousSession({ ...args, distinctId: 'bob' })).resolves.toBe(false);

    expect(mocks.kafka.sendMessage).toHaveBeenCalledTimes(1);
  });

  test('lets the owning identity claim again', async () => {
    await tryClaimAnonymousSession({ ...args, distinctId: 'alice' });

    await expect(tryClaimAnonymousSession({ ...args, distinctId: 'alice' })).resolves.toBe(true);
  });

  test('refuses when ClickHouse already links another identity', async () => {
    mocks.rawQuery.mockResolvedValue([{ distinctId: 'bob' }]);

    await expect(tryClaimAnonymousSession({ ...args, distinctId: 'alice' })).resolves.toBe(false);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  test('declines reuse without Redis, where no atomic claim is possible', async () => {
    mocks.redis.enabled = false;

    await expect(tryClaimAnonymousSession({ ...args, distinctId: 'alice' })).resolves.toBe(false);
    expect(mocks.rawQuery).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
