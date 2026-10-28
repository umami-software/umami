import { beforeEach, describe, expect, test, vi } from 'vitest';
import { clearWebsiteData, getWebsiteDataCounts } from './websiteDataRange';

const { transactionMock, getSchemaMock } = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  getSchemaMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    transaction: transactionMock,
  },
  getSchema: getSchemaMock,
}));

const websiteId = '11111111-1111-4111-8111-111111111111';
const startDate = new Date('2026-09-01T00:00:00.000Z');
const endDate = new Date('2026-10-01T00:00:00.000Z');
const range = { websiteId, createdAt: { gte: startDate, lt: endDate } };

function createTx({
  sessionIds = [] as string[],
  visitIds = [] as string[],
  orphanVisitIds = [] as string[],
  counts = {} as Record<string, number>,
  // First and last row in the range, read by the preview. Defaults to the whole of September.
  bounds = {
    first_at: new Date('2026-09-01T00:00:00.000Z'),
    last_at: new Date('2026-09-30T23:59:59.999Z'),
  } as { first_at: Date | null; last_at: Date | null },
} = {}) {
  const calls: string[] = [];
  const model = (name: string, deleted = 0) => ({
    count: vi.fn(async () => counts[name] ?? 0),
    deleteMany: vi.fn(async () => {
      calls.push(name);
      return { count: deleted };
    }),
  });

  return {
    calls,
    websiteEvent: model('websiteEvent', 40),
    revenue: model('revenue', 3),
    heatmapEvent: model('heatmapEvent', 5),
    sessionReplay: model('sessionReplay'),
    $queryRawUnsafe: vi.fn(async (sql: string, ..._params: unknown[]) => {
      if (sql.includes('as first_at')) {
        calls.push('bounds');
        return [bounds];
      }
      if (sql.startsWith('with orphan')) {
        calls.push('previewMonth');
        return [
          {
            sessions: counts.sessions ?? 0,
            event_data: counts.eventData ?? 0,
            orphan_revenue: counts.orphanRevenue ?? 0,
            orphan_heatmaps: counts.orphanHeatmaps ?? 0,
            replays: counts.replays ?? 0,
          },
        ];
      }
      if (sql.includes('unnest($2::uuid[])')) {
        calls.push('countRemovedVisits');
        // Every visit that lost chunks is gone unless the test says otherwise.
        return [{ count: counts.removedVisits ?? (_params[1] as string[]).length }];
      }
      if (sql.includes('candidate.session_id')) {
        calls.push('selectSessions');
        return sessionIds.map(id => ({ id }));
      }
      if (sql.includes('any($2::uuid[])') && sql.includes('session_replay.visit_id')) {
        calls.push('selectOrphanVisits');
        return orphanVisitIds.map(id => ({ id }));
      }
      if (sql.includes('session_replay.visit_id')) {
        calls.push('selectVisits');
        return visitIds.map(id => ({ id }));
      }
      throw new Error(`Unexpected query: ${sql}`);
    }),
    $executeRawUnsafe: vi.fn(async (sql: string, ..._params: unknown[]) => {
      if (sql.startsWith('SET search_path')) {
        calls.push('searchPath');
        return 0;
      }
      const table = sql.match(/^delete from (\w+)/)?.[1];
      calls.push(`raw:${table}`);
      if (table === 'event_data') return sql.includes(' using ') ? 3 : 4;
      if (table === 'session') return sessionIds.length;
      if (table === 'revenue') return counts.orphanRevenue ?? 0;
      if (table === 'heatmap_event') return counts.orphanHeatmaps ?? 0;
      return 0;
    }),
  };
}

beforeEach(() => {
  transactionMock.mockReset();
  getSchemaMock.mockReset();
  getSchemaMock.mockReturnValue(null);
});

describe('clearWebsiteData', () => {
  test('collects orphans first, then deletes in dependency order and returns counts', async () => {
    const tx = createTx({ sessionIds: ['s1', 's2'], visitIds: ['v1'] });
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await clearWebsiteData(websiteId, startDate, endDate);

    expect(tx.calls).toEqual([
      'selectSessions',
      'selectVisits',
      'selectOrphanVisits',
      'raw:event_data',
      'raw:event_data',
      'revenue',
      'heatmapEvent',
      'sessionReplay',
      'websiteEvent',
      'raw:session_data',
      'raw:session_link',
      'raw:session_replay',
      'raw:heatmap_event',
      'raw:revenue',
      'raw:session',
      'countRemovedVisits',
      'raw:session_replay_saved',
    ]);
    expect(result).toEqual({
      events: 40,
      eventData: 7,
      sessions: 2,
      revenue: 3,
      replays: 1,
      heatmaps: 5,
    });
    expect(tx.websiteEvent.deleteMany).toHaveBeenCalledWith({ where: range });
    expect(tx.revenue.deleteMany).toHaveBeenCalledWith({ where: range });
    expect(tx.heatmapEvent.deleteMany).toHaveBeenCalledWith({ where: range });
    expect(tx.sessionReplay.deleteMany).toHaveBeenCalledWith({ where: range });
    expect(transactionMock).toHaveBeenCalledWith(expect.any(Function), { timeout: 30000 });
  });

  test('passes orphan session ids as a single uuid[] parameter, however many there are', async () => {
    const sessionIds = Array.from({ length: 50_000 }, (_, i) => `session-${i}`);
    const tx = createTx({ sessionIds });
    transactionMock.mockImplementation(async cb => cb(tx));

    await clearWebsiteData(websiteId, startDate, endDate);

    const sessionDelete = tx.$executeRawUnsafe.mock.calls.find(([sql]) =>
      sql.startsWith('delete from session '),
    );
    expect(sessionDelete).toEqual([
      expect.stringContaining('session_id = any($2::uuid[])'),
      websiteId,
      sessionIds,
    ]);
  });

  test('skips session and saved replay deletes when nothing is orphaned', async () => {
    const tx = createTx();
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await clearWebsiteData(websiteId, startDate, endDate);

    expect(tx.calls).not.toContain('selectOrphanVisits');
    expect(tx.calls).not.toContain('raw:session');
    expect(tx.calls).not.toContain('raw:session_replay_saved');
    expect(result.sessions).toBe(0);
    expect(result.replays).toBe(0);
  });

  test('orphan sessions exclude sessions with events outside the range', async () => {
    const tx = createTx();
    transactionMock.mockImplementation(async cb => cb(tx));

    await clearWebsiteData(websiteId, startDate, endDate);

    const [orphanSql, ...params] = tx.$queryRawUnsafe.mock.calls[0];
    expect(orphanSql).toContain('not exists');
    expect(orphanSql).toContain(
      'website_event.created_at < $2 or website_event.created_at >= $3 or website_event.created_at is null',
    );
    expect(params).toEqual([websiteId, startDate, endDate]);
  });

  test('deletes event data with two indexed statements and sums their counts', async () => {
    const tx = createTx();
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await clearWebsiteData(websiteId, startDate, endDate);

    const deletes = tx.$executeRawUnsafe.mock.calls.filter(([sql]) =>
      sql.startsWith('delete from event_data'),
    );
    expect(deletes).toHaveLength(2);
    expect(deletes[0][0]).toContain('website_id = $1::uuid');
    expect(deletes[0][0]).not.toContain('select');
    expect(deletes[1][0]).toContain('using website_event');
    expect(deletes[1][0]).toContain('event_data.website_event_id = website_event.event_id');
    expect(deletes.map(([, ...params]) => params)).toEqual([
      [websiteId, startDate, endDate],
      [websiteId, startDate, endDate],
    ]);
    expect(result.eventData).toBe(7);
  });

  test('orphan sessions are driven from events in range', async () => {
    const tx = createTx();
    transactionMock.mockImplementation(async cb => cb(tx));

    await clearWebsiteData(websiteId, startDate, endDate);

    const [orphanSql] = tx.$queryRawUnsafe.mock.calls[0];
    expect(orphanSql).toContain('select distinct website_event.session_id from website_event');
    expect(orphanSql).not.toContain('from session ');
  });

  test('cleans saved replays of orphan sessions whose chunks sit outside the range', async () => {
    const tx = createTx({
      sessionIds: ['s1'],
      visitIds: ['v1', 'v2'],
      orphanVisitIds: ['v2', 'v3'],
    });
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await clearWebsiteData(websiteId, startDate, endDate);

    const savedDelete = tx.$executeRawUnsafe.mock.calls.find(([sql]) =>
      sql.startsWith('delete from session_replay_saved'),
    );
    expect(savedDelete?.[2]).toEqual(['v1', 'v2', 'v3']);
    expect(result.replays).toBe(3);
    expect(tx.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('unnest($2::uuid[])'),
      websiteId,
      ['v1', 'v2', 'v3'],
    );
    const orphanVisits = tx.$queryRawUnsafe.mock.calls.find(([sql]) =>
      sql.includes('any($2::uuid[])'),
    );
    expect(orphanVisits?.slice(1)).toEqual([websiteId, ['s1']]);
  });

  test('counts revenue and heatmap events of orphan sessions outside the range', async () => {
    const tx = createTx({ sessionIds: ['s1'], counts: { orphanRevenue: 2, orphanHeatmaps: 4 } });
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await clearWebsiteData(websiteId, startDate, endDate);

    expect(result.revenue).toBe(5);
    expect(result.heatmaps).toBe(9);
  });

  test('counts only replays left with no chunk', async () => {
    const tx = createTx({ visitIds: ['v1', 'v2'], counts: { removedVisits: 1 } });
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await clearWebsiteData(websiteId, startDate, endDate);

    expect(result.replays).toBe(1);
    const [sql] = tx.$queryRawUnsafe.mock.calls.find(([s]) => s.includes('unnest')) ?? [];
    expect(sql).toContain('not exists');
  });

  test('sets search_path first when the database url has a schema', async () => {
    getSchemaMock.mockReturnValue('umami');
    const tx = createTx();
    transactionMock.mockImplementation(async cb => cb(tx));

    await clearWebsiteData(websiteId, startDate, endDate);

    expect(tx.calls[0]).toBe('searchPath');
    expect(tx.$executeRawUnsafe).toHaveBeenCalledWith('SET search_path TO "umami";');
  });
});

describe('getWebsiteDataCounts', () => {
  test('returns preview counts for a single month', async () => {
    const tx = createTx({
      counts: {
        websiteEvent: 40,
        revenue: 3,
        orphanRevenue: 2,
        heatmapEvent: 6,
        orphanHeatmaps: 1,
        eventData: 7,
        sessions: 2,
        replays: 1,
      },
    });
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await getWebsiteDataCounts(websiteId, startDate, endDate);

    expect(result).toEqual({
      events: 40,
      eventData: 7,
      sessions: 2,
      revenue: 5,
      replays: 1,
      heatmaps: 7,
    });
    expect(tx.websiteEvent.count).toHaveBeenCalledWith({ where: range });
    expect(tx.revenue.count).toHaveBeenCalledWith({ where: range });
    expect(tx.heatmapEvent.count).toHaveBeenCalledWith({ where: range });
    expect(tx.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('with orphan'),
      websiteId,
      startDate,
      endDate,
      startDate,
      endDate,
    );
    expect(tx.websiteEvent.deleteMany).not.toHaveBeenCalled();
  });

  test('returns zeros without a month query when the range holds no data', async () => {
    const tx = createTx({ bounds: { first_at: null, last_at: null } });
    transactionMock.mockImplementation(async cb => cb(tx));

    const result = await getWebsiteDataCounts(websiteId, new Date(0), endDate);

    expect(result).toEqual({
      events: 0,
      eventData: 0,
      sessions: 0,
      revenue: 0,
      replays: 0,
      heatmaps: 0,
    });
    expect(tx.calls).toEqual(['bounds']);
    expect(tx.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('least('),
      websiteId,
      new Date(0),
      endDate,
    );
  });

  test('runs one transaction per UTC month between the first and last data', async () => {
    const start = new Date(0);
    const end = new Date('2027-01-01T00:00:00.000Z');
    const firstAt = new Date('2026-01-15T00:00:00.000Z');
    const lastAt = new Date('2026-03-09T23:59:59.999Z');
    const boundsTx = createTx({ bounds: { first_at: firstAt, last_at: lastAt } });
    const monthTxs = [1, 2, 3].map(() =>
      createTx({
        counts: {
          websiteEvent: 10,
          revenue: 1,
          heatmapEvent: 2,
          eventData: 2,
          sessions: 1,
          replays: 1,
        },
      }),
    );

    for (const tx of [boundsTx, ...monthTxs]) {
      transactionMock.mockImplementationOnce(async cb => cb(tx));
    }

    const result = await getWebsiteDataCounts(websiteId, start, end);

    expect(transactionMock).toHaveBeenCalledTimes(4);
    expect(transactionMock).toHaveBeenCalledWith(expect.any(Function), { timeout: 30000 });
    expect(result).toEqual({
      events: 30,
      eventData: 6,
      sessions: 3,
      revenue: 3,
      replays: 3,
      heatmaps: 6,
    });
    // Months cover only the data, while the orphan checks keep the full range.
    expect(monthTxs.map(tx => tx.$queryRawUnsafe.mock.calls[0].slice(2, 6))).toEqual([
      [firstAt, new Date('2026-02-01T00:00:00.000Z'), start, end],
      [new Date('2026-02-01T00:00:00.000Z'), new Date('2026-03-01T00:00:00.000Z'), start, end],
      [new Date('2026-03-01T00:00:00.000Z'), new Date('2026-03-10T00:00:00.000Z'), start, end],
    ]);
  });

  test('counts each orphan session, event data row and replay in one month only', async () => {
    const tx = createTx();
    transactionMock.mockImplementation(async cb => cb(tx));

    await getWebsiteDataCounts(websiteId, startDate, endDate);

    const [sql] = tx.$queryRawUnsafe.mock.calls.find(([s]) => s.startsWith('with orphan')) ?? [];
    // Sessions: no event before the month start or after the range end.
    expect(sql).toContain(
      'website_event.created_at < $2 or website_event.created_at >= $5 or website_event.created_at is null',
    );
    // Event data counted by parent only when its own timestamp is outside the range.
    expect(sql).toContain('where not (event_data.website_id = $1::uuid');
    // Replays: every chunk from the month start up to the range end.
    expect(sql).toContain(
      'other.created_at < $2 or other.created_at >= $5 or other.created_at is null',
    );
  });

  test('uses the same event data predicates as the delete', async () => {
    const previewTx = createTx();
    const clearTx = createTx();
    transactionMock.mockImplementationOnce(async cb => cb(previewTx));
    transactionMock.mockImplementationOnce(async cb => cb(previewTx));
    transactionMock.mockImplementationOnce(async cb => cb(clearTx));

    await getWebsiteDataCounts(websiteId, startDate, endDate);
    await clearWebsiteData(websiteId, startDate, endDate);

    const [previewSql] =
      previewTx.$queryRawUnsafe.mock.calls.find(([s]) => s.startsWith('with orphan')) ?? [];
    const eventDataDeletes = clearTx.$executeRawUnsafe.mock.calls
      .map(([sql]) => sql)
      .filter(sql => sql.startsWith('delete from event_data'));

    expect(eventDataDeletes).toHaveLength(2);
    expect(previewSql).toContain(eventDataDeletes[0].replace('delete from event_data where ', ''));
    expect(previewSql).toContain(
      eventDataDeletes[1].replace('delete from event_data using website_event where ', ''),
    );
  });
});
