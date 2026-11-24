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
    clickhouseRawQueryMock
      .mockResolvedValueOnce([
        { visitId: 'visit-1', sessionId: 'session-1', startAt: 'start', endAt: 'end' },
        { visitId: 'visit-2', sessionId: 'session-2', startAt: 'start', endAt: 'end' },
      ])
      .mockResolvedValueOnce([{ sessionId: 'session-1', distinctId: 'linked-a' }])
      .mockResolvedValueOnce([
        { visitId: 'visit-1', distinctId: 'legacy' },
        { visitId: 'visit-2', distinctId: 'user-b' },
      ]);

    expect(await getReplayDistinctIds('website-1', ['visit-1', 'visit-2'])).toEqual({
      'visit-1': ['linked-a'],
      'visit-2': ['user-b'],
    });
    expect(prismaRawQueryMock).not.toHaveBeenCalled();
  });

  // website_event is sorted by time first: without a time range the lookup reads every site's
  // full history, which timed out the replay list in production.
  test('bounds the ClickHouse event lookup by the time of the replay chunks', async () => {
    db.current = 'clickhouse';
    clickhouseRawQueryMock
      .mockResolvedValueOnce([
        { visitId: 'visit-1', sessionId: 'session-1', startAt: 'start', endAt: 'end' },
      ])
      .mockResolvedValue([]);

    await getReplayDistinctIds('website-1', ['visit-1']);

    const [query, params] = clickhouseRawQueryMock.mock.calls.find(([sql]) =>
      sql.includes('from website_event'),
    );
    expect(query).toContain('created_at between {startAt:DateTime64} and {endAt:DateTime64}');
    expect(params).toMatchObject({ startAt: 'start', endAt: 'end' });
  });

  test('skips the ClickHouse lookups when no visit has a recording', async () => {
    db.current = 'clickhouse';
    clickhouseRawQueryMock.mockResolvedValueOnce([]);

    expect(await getReplayDistinctIds('website-1', ['visit-1'])).toEqual({ 'visit-1': [] });
    expect(clickhouseRawQueryMock).toHaveBeenCalledTimes(1);
  });

  test('skips the query for an empty page', async () => {
    expect(await getReplayDistinctIds('website-1', [])).toEqual({});
    expect(prismaRawQueryMock).not.toHaveBeenCalled();
  });
});
