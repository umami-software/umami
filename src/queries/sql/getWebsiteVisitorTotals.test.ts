import { beforeEach, describe, expect, test, vi } from 'vitest';
import { EVENT_TYPE } from '@/lib/constants';
import { getWebsiteVisitorTotals } from './getWebsiteVisitorTotals';

const { rawQueryMock, clickhouseRawQueryMock, dbState } = vi.hoisted(() => ({
  rawQueryMock: vi.fn(),
  clickhouseRawQueryMock: vi.fn(),
  dbState: { current: 'prisma' },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: rawQueryMock,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    rawQuery: clickhouseRawQueryMock,
  },
}));

vi.mock('@/lib/db', () => ({
  PRISMA: 'prisma',
  CLICKHOUSE: 'clickhouse',
  runQuery: (queries: Record<string, () => unknown>) => queries[dbState.current](),
}));

const range = {
  startDate: new Date('2026-11-01T00:00:00.000Z'),
  endDate: new Date('2026-11-07T23:59:59.999Z'),
};

describe('getWebsiteVisitorTotals', () => {
  beforeEach(() => {
    rawQueryMock.mockReset();
    clickhouseRawQueryMock.mockReset();
    dbState.current = 'prisma';
  });

  test('does not query without websites', async () => {
    await expect(getWebsiteVisitorTotals([], range)).resolves.toEqual({});

    expect(rawQueryMock).not.toHaveBeenCalled();
    expect(clickhouseRawQueryMock).not.toHaveBeenCalled();
  });

  test('maps the counts to numbers by website on PostgreSQL', async () => {
    rawQueryMock.mockResolvedValue([
      { websiteId: 'a', visitors: '12' },
      { websiteId: 'b', visitors: 3n },
    ]);

    await expect(getWebsiteVisitorTotals(['a', 'b', 'c'], range)).resolves.toEqual({
      a: 12,
      b: 3,
    });

    const [sql, params] = rawQueryMock.mock.calls[0];

    expect(sql).toContain('count(distinct session_id)');
    expect(sql).toContain(
      `event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})`,
    );
    expect(params).toEqual({ websiteIds: ['a', 'b', 'c'], ...range });
  });

  test('maps the counts to numbers by website on ClickHouse', async () => {
    dbState.current = 'clickhouse';
    clickhouseRawQueryMock.mockResolvedValue([{ websiteId: 'a', visitors: '7' }]);

    await expect(getWebsiteVisitorTotals(['a'], range)).resolves.toEqual({ a: 7 });

    const [sql, params] = clickhouseRawQueryMock.mock.calls[0];

    expect(sql).toContain('uniq(session_id)');
    expect(sql).toContain('from website_event_stats_hourly');
    expect(sql).toContain(
      `event_type NOT IN (${EVENT_TYPE.customEvent}, ${EVENT_TYPE.performance})`,
    );
    expect(params).toEqual({ websiteIds: ['a'], ...range });
  });
});
