import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getReplayDistinctIds } from './getReplayDistinctIds';

const { prismaRawQueryMock, clickhouseRawQueryMock, db } = vi.hoisted(() => ({
  prismaRawQueryMock: vi.fn(),
  clickhouseRawQueryMock: vi.fn(),
  db: { current: 'prisma' },
}));

vi.mock('@/lib/prisma', () => ({ default: { rawQuery: prismaRawQueryMock } }));
vi.mock('@/lib/clickhouse', () => ({ default: { rawQuery: clickhouseRawQueryMock } }));
vi.mock('@/lib/db', () => ({
  PRISMA: 'prisma',
  CLICKHOUSE: 'clickhouse',
  runQuery: (queries: Record<string, () => unknown>) => queries[db.current](),
}));

describe('getReplayDistinctIds', () => {
  beforeEach(() => {
    db.current = 'prisma';
    prismaRawQueryMock.mockReset();
    clickhouseRawQueryMock.mockReset();
  });

  test('prefers linked IDs over the session distinct ID', async () => {
    prismaRawQueryMock.mockResolvedValue([
      { visitId: 'visit-1', distinctId: 'user-b', linked: true },
      { visitId: 'visit-1', distinctId: 'user-a', linked: true },
      { visitId: 'visit-1', distinctId: 'legacy', linked: false },
      { visitId: 'visit-2', distinctId: 'user-c', linked: false },
    ]);

    const result = await getReplayDistinctIds('website-1', ['visit-1', 'visit-2', 'visit-3']);

    expect(result).toEqual({
      'visit-1': ['user-a', 'user-b'],
      'visit-2': ['user-c'],
      'visit-3': [],
    });
    expect(prismaRawQueryMock.mock.calls[0][1]).toEqual({
      websiteId: 'website-1',
      visitIds: ['visit-1', 'visit-2', 'visit-3'],
    });
  });

  test('uses the ClickHouse query when ClickHouse is enabled', async () => {
    db.current = 'clickhouse';
    clickhouseRawQueryMock.mockResolvedValue([
      { visitId: 'visit-1', distinctId: 'user-a', linked: 0 },
    ]);

    expect(await getReplayDistinctIds('website-1', ['visit-1'])).toEqual({
      'visit-1': ['user-a'],
    });
    expect(prismaRawQueryMock).not.toHaveBeenCalled();
  });

  test('skips the query for an empty page', async () => {
    expect(await getReplayDistinctIds('website-1', [])).toEqual({});
    expect(prismaRawQueryMock).not.toHaveBeenCalled();
  });
});
