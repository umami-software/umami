import { beforeEach, expect, test, vi } from 'vitest';
import { clickhouseQuery } from './saveRevenue';

const { insertMock, getUTCStringMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  getUTCStringMock: vi.fn(),
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    insert: insertMock,
    getUTCString: getUTCStringMock,
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      revenue: {
        create: vi.fn(),
      },
    },
  },
}));

beforeEach(() => {
  insertMock.mockReset();
  getUTCStringMock.mockReset();
  getUTCStringMock.mockReturnValue('2026-10-20 12:00:00');
});

test('writes one ClickHouse revenue row from the complete event payload', async () => {
  const createdAt = new Date('2026-10-20T12:00:00.000Z');

  await clickhouseQuery({
    websiteId: 'website-1',
    sessionId: 'session-1',
    eventId: 'event-1',
    eventName: 'purchase',
    currency: 'USD',
    revenue: 19.99,
    createdAt,
  });

  expect(insertMock).toHaveBeenCalledWith('website_revenue', [
    {
      website_id: 'website-1',
      session_id: 'session-1',
      event_id: 'event-1',
      event_name: 'purchase',
      currency: 'USD',
      revenue: 19.99,
      created_at: '2026-10-20 12:00:00',
    },
  ]);
  expect(getUTCStringMock).toHaveBeenCalledWith(createdAt);
});
