import { afterEach, describe, expect, test, vi } from 'vitest';

const WEBSITE_ID = '00000000-0000-4000-8000-000000000001';

async function loadModule({ mode, rows = [] }: { mode: 'prisma' | 'clickhouse'; rows?: unknown[] }) {
  vi.resetModules();

  const state = { mode };
  const prismaRawQuery = vi.fn().mockResolvedValue(rows);
  const clickhouseRawQuery = vi.fn().mockResolvedValue(rows);

  // Mirrors the real helpers closely enough to assert which one was used.
  const prismaGetDateSQL = vi.fn(
    (field: string, unit: string, timezone?: string) =>
      `to_char(date_trunc('${unit}', ${field} at time zone '${timezone}'), 'YYYY-MM-DD HH24:00:00')`,
  );
  const clickhouseGetDateSQL = vi.fn(
    (field: string, unit: string) => `formatDateTime(${field}, '${unit}')`,
  );

  vi.doMock('@/lib/db', () => ({
    CLICKHOUSE: 'clickhouse',
    PRISMA: 'prisma',
    runQuery: vi.fn((queries: Record<string, () => unknown>) => queries[state.mode]()),
  }));

  vi.doMock('@/lib/prisma', () => ({
    default: { rawQuery: prismaRawQuery, getDateSQL: prismaGetDateSQL },
  }));

  vi.doMock('@/lib/clickhouse', () => ({
    default: { rawQuery: clickhouseRawQuery, getDateSQL: clickhouseGetDateSQL },
  }));

  const mod = await import('./getWebsiteListCharts');

  return {
    getWebsiteListCharts: mod.getWebsiteListCharts,
    countBuckets: mod.countBuckets,
    MAX_BUCKETS: mod.MAX_BUCKETS,
    prismaRawQuery,
    clickhouseRawQuery,
    prismaGetDateSQL,
    clickhouseGetDateSQL,
  };
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('getWebsiteListCharts bucketing', () => {
  test('defaults to the existing 12-hour buckets', async () => {
    const { getWebsiteListCharts, prismaGetDateSQL, prismaRawQuery } = await loadModule({
      mode: 'prisma',
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-10T00:00:00Z'),
      timezone: 'UTC',
    });

    const [query] = prismaRawQuery.mock.calls[0];

    expect(query).toContain('12 hour');
    expect(prismaGetDateSQL).not.toHaveBeenCalled();
    // Two days of 12-hour buckets, inclusive of the closing boundary.
    expect(result[WEBSITE_ID].values).toHaveLength(5);
  });

  test('day unit produces one bucket per day via the shared helper', async () => {
    const { getWebsiteListCharts, prismaGetDateSQL, prismaRawQuery } = await loadModule({
      mode: 'prisma',
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-10T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    const [query] = prismaRawQuery.mock.calls[0];

    expect(prismaGetDateSQL).toHaveBeenCalledWith('website_event.created_at', 'day', 'UTC');
    expect(query).not.toContain('12 hour');
    expect(result[WEBSITE_ID].values).toHaveLength(3);
  });

  test('hour unit produces one bucket per hour', async () => {
    const { getWebsiteListCharts, prismaGetDateSQL } = await loadModule({
      mode: 'prisma',
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-08T23:59:59Z'),
      timezone: 'UTC',
      unit: 'hour',
    });

    expect(prismaGetDateSQL).toHaveBeenCalledWith('website_event.created_at', 'hour', 'UTC');
    // A full day at hourly resolution, not two 12-hour blocks.
    expect(result[WEBSITE_ID].values).toHaveLength(24);
  });

  test('clickhouse uses its own date helper for explicit units', async () => {
    const { getWebsiteListCharts, clickhouseGetDateSQL } = await loadModule({
      mode: 'clickhouse',
    });

    await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-10T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    expect(clickhouseGetDateSQL).toHaveBeenCalledWith('website_event.created_at', 'day', 'UTC');
  });
});

describe('getWebsiteListCharts daylight saving time', () => {
  // A local day is 23 or 25 hours long across a DST transition. Stepping by a
  // fixed 24 hours would drift the labels off midnight from the transition
  // onwards, so every following bucket would match no row and read back as 0.
  test('day buckets stay on local midnight across the autumn transition', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        // 2026-10-25 is the 25-hour day in Europe/Berlin.
        { websiteId: WEBSITE_ID, x: '2026-10-25 00:00:00', y: 4 },
        { websiteId: WEBSITE_ID, x: '2026-10-26 00:00:00', y: 7 },
        { websiteId: WEBSITE_ID, x: '2026-10-27 00:00:00', y: 5 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-10-24T22:00:00Z'), // 2026-10-25 00:00 Berlin
      endDate: new Date('2026-10-27T22:59:00Z'),
      timezone: 'Europe/Berlin',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].values).toEqual([4, 7, 5]);
  });

  test('day buckets stay on local midnight across the spring transition', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        // 2026-03-29 is the 23-hour day in Europe/Berlin.
        { websiteId: WEBSITE_ID, x: '2026-03-29 00:00:00', y: 2 },
        { websiteId: WEBSITE_ID, x: '2026-03-30 00:00:00', y: 6 },
        { websiteId: WEBSITE_ID, x: '2026-03-31 00:00:00', y: 3 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-03-28T23:00:00Z'), // 2026-03-29 00:00 Berlin
      endDate: new Date('2026-03-31T21:59:00Z'),
      timezone: 'Europe/Berlin',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].values).toEqual([2, 6, 3]);
  });

  test('day buckets keep advancing where the transition falls on midnight', async () => {
    // America/Santiago springs forward at 00:00, so 2026-09-06 00:00 local
    // does not exist. The series must still advance one day at a time.
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [{ websiteId: WEBSITE_ID, x: '2026-09-04 00:00:00', y: 1 }],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-09-04T04:00:00Z'),
      endDate: new Date('2026-09-08T04:00:00Z'),
      timezone: 'America/Santiago',
      unit: 'day',
    });

    // Five distinct days, not one bucket repeated.
    expect(result[WEBSITE_ID].values).toHaveLength(5);
  });

  test('the repeated autumn hour lands in the first of the two buckets', async () => {
    // 02:00 local exists twice on 2026-10-25 in Europe/Berlin, and the
    // database reports both as a single 02:00 row.
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        { websiteId: WEBSITE_ID, x: '2026-10-25 01:00:00', y: 5 },
        { websiteId: WEBSITE_ID, x: '2026-10-25 02:00:00', y: 9 },
        { websiteId: WEBSITE_ID, x: '2026-10-25 03:00:00', y: 4 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-10-24T23:00:00Z'), // 01:00 Berlin
      endDate: new Date('2026-10-25T02:00:00Z'), // 03:00 Berlin
      timezone: 'Europe/Berlin',
      unit: 'hour',
    });

    // No leading gap before the repeated hour.
    expect(result[WEBSITE_ID].values.slice(0, 3)).toEqual([5, 9, 0]);
  });

  test('the transition day itself is not lost where midnight does not exist', async () => {
    // America/Santiago springs forward at 00:00 on 2026-09-06, so that day has
    // no local midnight. The database still truncates it to 2026-09-06.
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        { websiteId: WEBSITE_ID, x: '2026-09-05 00:00:00', y: 7 },
        { websiteId: WEBSITE_ID, x: '2026-09-06 00:00:00', y: 8 },
        { websiteId: WEBSITE_ID, x: '2026-09-07 00:00:00', y: 9 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-09-05T04:00:00Z'),
      endDate: new Date('2026-09-07T05:00:00Z'),
      timezone: 'America/Santiago',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].values).toEqual([7, 8, 9]);
  });
});

describe('getWebsiteListCharts minute resolution', () => {
  // Labels used to be formatted with a hardcoded `HH:00:00`, so every minute
  // of an hour collapsed onto the same key and the values were lost.
  test('minute buckets stay distinct', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        { websiteId: WEBSITE_ID, x: '2026-08-08 11:00:00', y: 1 },
        { websiteId: WEBSITE_ID, x: '2026-08-08 11:01:00', y: 4 },
        { websiteId: WEBSITE_ID, x: '2026-08-08 11:02:00', y: 2 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T11:00:00Z'),
      endDate: new Date('2026-08-08T11:02:00Z'),
      timezone: 'UTC',
      unit: 'minute',
    });

    expect(result[WEBSITE_ID].values).toEqual([1, 4, 2]);
  });

  test('an oversized range is reported, not silently truncated', async () => {
    const { countBuckets, MAX_BUCKETS } = await loadModule({ mode: 'prisma' });

    // A year of minutes is far beyond the cap; the route rejects such a
    // request so `values` can never contradict `total`.
    const count = countBuckets(
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-12-31T23:59:00Z'),
      'UTC',
      'minute',
    );

    expect(count).toBeGreaterThan(MAX_BUCKETS);
  });

  test('a range within the cap is not flagged', async () => {
    const { countBuckets, MAX_BUCKETS } = await loadModule({ mode: 'prisma' });

    const count = countBuckets(
      new Date('2026-08-01T00:00:00Z'),
      new Date('2026-08-31T00:00:00Z'),
      'UTC',
      'day',
    );

    expect(count).toBe(31);
    expect(count).toBeLessThanOrEqual(MAX_BUCKETS);
  });
});

describe('getWebsiteListCharts bucket alignment', () => {
  // The alignment regression test above uses `unit: 'day'`, which is aligned by
  // the calendar path. This covers the snapping used for hour/minute.
  test('an unaligned start is snapped down on the hour path', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        { websiteId: WEBSITE_ID, x: '2026-08-08 11:00:00', y: 5 },
        { websiteId: WEBSITE_ID, x: '2026-08-08 12:00:00', y: 8 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      // 11:37 must be snapped down to the 11:00 bucket, otherwise the labels
      // carry the offset and match no row.
      startDate: new Date('2026-08-08T11:37:00Z'),
      endDate: new Date('2026-08-08T12:30:00Z'),
      timezone: 'UTC',
      unit: 'hour',
    });

    expect(result[WEBSITE_ID].values).toEqual([5, 8]);
  });

  test('the bucket start never moves ahead of the requested start', async () => {
    // The repeated 02:xx hour is ambiguous and resolves to its second
    // occurrence, which would drop the first hour of the range entirely.
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [{ websiteId: WEBSITE_ID, x: '2026-10-25 02:58:00', y: 3 }],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-10-25T00:58:00Z'), // first 02:58 in Berlin
      endDate: new Date('2026-10-25T01:05:00Z'),
      timezone: 'Europe/Berlin',
      unit: 'minute',
    });

    expect(result[WEBSITE_ID].values.length).toBeGreaterThan(0);
    expect(result[WEBSITE_ID].values[0]).toBe(3);
  });

  // Regression: an unaligned startDate used to generate labels that never
  // matched the truncated values, leaving every bucket at 0 while total stayed
  // correct — a silent failure behind a 200 response.
  test('counts land in their bucket even when startDate is not aligned', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [
        { websiteId: WEBSITE_ID, x: '2026-08-08 00:00:00', y: 7 },
        { websiteId: WEBSITE_ID, x: '2026-08-09 00:00:00', y: 5 },
        { websiteId: WEBSITE_ID, x: null, y: 12 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      // Deliberately mid-day, as a naive "now minus 7 days" would produce.
      startDate: new Date('2026-08-08T11:48:44Z'),
      endDate: new Date('2026-08-10T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].total).toBe(12);
    expect(result[WEBSITE_ID].values.reduce((a, b) => a + b, 0)).toBe(12);
    expect(result[WEBSITE_ID].values[0]).toBe(7);
  });

  // Regression: with an explicit unit the ClickHouse bucket must stay a String.
  // A DateTime column renders the GROUPING SETS subtotal as the epoch rather
  // than an empty value, which formatResults would mistake for a data point —
  // leaving `total` at 0.
  test('clickhouse keeps the bucket a formatted string for explicit units', async () => {
    const { getWebsiteListCharts, clickhouseRawQuery } = await loadModule({
      mode: 'clickhouse',
    });

    await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-10T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    const [query] = clickhouseRawQuery.mock.calls[0];

    expect(query).toContain('formatDateTime');
    expect(query).toContain('%Y-%m-%d %T');
  });

  test('clickhouse reports the subtotal row as the total, not a bucket', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'clickhouse',
      rows: [
        { websiteId: WEBSITE_ID, x: '2026-08-08 00:00:00', y: 2 },
        { websiteId: WEBSITE_ID, x: '', y: 3 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-09T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].total).toBe(3);
    expect(result[WEBSITE_ID].values[0]).toBe(2);
  });

  test('matches date-only values as produced by clickhouse', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'clickhouse',
      rows: [
        // ClickHouse renders day buckets without a time component.
        { websiteId: WEBSITE_ID, x: '2026-08-08', y: 4 },
        { websiteId: WEBSITE_ID, x: '', y: 4 },
      ],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-09T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].values[0]).toBe(4);
  });

  test('matches ISO values with a trailing Z as produced on the UTC path', async () => {
    const { getWebsiteListCharts } = await loadModule({
      mode: 'prisma',
      rows: [{ websiteId: WEBSITE_ID, x: '2026-08-08T00:00:00Z', y: 3 }],
    });

    const result = await getWebsiteListCharts([WEBSITE_ID], {
      startDate: new Date('2026-08-08T00:00:00Z'),
      endDate: new Date('2026-08-09T00:00:00Z'),
      timezone: 'UTC',
      unit: 'day',
    });

    expect(result[WEBSITE_ID].values[0]).toBe(3);
  });
});
