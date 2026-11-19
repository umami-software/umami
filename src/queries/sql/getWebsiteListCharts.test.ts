import { fromZonedTime } from 'date-fns-tz';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getWebsiteListCharts } from './getWebsiteListCharts';

const { rawQueryMock } = vi.hoisted(() => ({
  rawQueryMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    rawQuery: rawQueryMock,
  },
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {},
}));

vi.mock('@/lib/db', () => ({
  PRISMA: 'prisma',
  CLICKHOUSE: 'clickhouse',
  runQuery: (queries: Record<string, () => unknown>) => queries.prisma(),
}));

const websiteId = '00000000-0000-0000-0000-000000000001';

// Every 12-hour bucket the SQL query returns, keyed on local wall-clock time
function getPoints(days: string[]) {
  return days.flatMap(day => [
    { websiteId, x: `${day} 00:00:00`, y: 1 },
    { websiteId, x: `${day} 12:00:00`, y: 1 },
  ]);
}

describe('getWebsiteListCharts', () => {
  beforeEach(() => {
    rawQueryMock.mockReset();
  });

  test('keeps buckets aligned when DST starts inside the range', async () => {
    const timezone = 'Australia/Adelaide';
    const days = ['2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06'];

    rawQueryMock.mockResolvedValue(getPoints(days));

    const charts = await getWebsiteListCharts([websiteId], {
      startDate: fromZonedTime('2026-10-02 00:00:00', timezone),
      endDate: fromZonedTime('2026-10-06 23:59:59.999', timezone),
      timezone,
    });

    expect(charts[websiteId].values).toEqual(Array(days.length * 2).fill(1));
  });

  test('keeps buckets aligned when DST ends inside the range', async () => {
    const timezone = 'Europe/London';
    const days = ['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-26', '2026-10-27'];

    rawQueryMock.mockResolvedValue(getPoints(days));

    const charts = await getWebsiteListCharts([websiteId], {
      startDate: fromZonedTime('2026-10-23 00:00:00', timezone),
      endDate: fromZonedTime('2026-10-27 23:59:59.999', timezone),
      timezone,
    });

    expect(charts[websiteId].values).toEqual(Array(days.length * 2).fill(1));
  });

  test('starts and ends on the buckets that contain the range bounds', async () => {
    const timezone = 'UTC';

    rawQueryMock.mockResolvedValue([
      { websiteId, x: '2026-10-01 12:00:00', y: 3 },
      { websiteId, x: '2026-10-02 00:00:00', y: 4 },
      { websiteId, x: null, y: 6 },
    ]);

    const charts = await getWebsiteListCharts([websiteId], {
      startDate: new Date('2026-10-01T15:00:00Z'),
      endDate: new Date('2026-10-02T09:00:00Z'),
      timezone,
    });

    expect(charts[websiteId]).toEqual({ values: [3, 4], total: 6 });
  });
});
