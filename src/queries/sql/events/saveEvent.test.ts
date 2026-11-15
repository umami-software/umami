import { beforeEach, expect, test, vi } from 'vitest';
import { saveEvent } from './saveEvent';

const { getUTCStringMock, insertMock, saveEventDataMock, saveRevenueMock } = vi.hoisted(() => ({
  getUTCStringMock: vi.fn(),
  insertMock: vi.fn(),
  saveEventDataMock: vi.fn(),
  saveRevenueMock: vi.fn(),
}));

vi.mock('@/lib/clickhouse', () => ({
  default: {
    getUTCString: getUTCStringMock,
    insert: insertMock,
  },
}));

vi.mock('@/lib/crypto', () => ({
  uuid: () => 'event-1',
}));

vi.mock('@/lib/db', () => ({
  CLICKHOUSE: 'clickhouse',
  PRISMA: 'prisma',
  runQuery: (queries: Record<string, () => Promise<void>>) => queries.clickhouse(),
}));

vi.mock('@/lib/kafka', () => ({
  default: {
    enabled: false,
  },
}));

vi.mock('@/lib/prisma', () => ({
  default: {},
}));

vi.mock('./saveEventData', () => ({
  saveEventData: saveEventDataMock,
}));

vi.mock('./saveRevenue', () => ({
  saveRevenue: saveRevenueMock,
}));

beforeEach(() => {
  getUTCStringMock.mockReset();
  insertMock.mockReset();
  saveEventDataMock.mockReset();
  saveRevenueMock.mockReset();
  getUTCStringMock.mockReturnValue('2026-10-20 12:00:00');
});

const event = (eventData: Record<string, unknown>) =>
  saveEvent({
    websiteId: 'website-1',
    sessionId: 'session-1',
    visitId: 'visit-1',
    eventType: 2,
    eventName: 'purchase',
    urlPath: '/',
    eventData,
  });

test('normalizes documented string revenue before writing it directly to ClickHouse', async () => {
  await event({ revenue: '19.99', currency: ' USD ' });

  expect(saveRevenueMock).toHaveBeenCalledWith(
    expect.objectContaining({
      websiteId: 'website-1',
      sessionId: 'session-1',
      eventId: 'event-1',
      currency: 'USD',
      revenue: 19.99,
    }),
  );
});

test.each([
  { revenue: 0, currency: 'USD' },
  { revenue: -19.99, currency: 'USD' },
  { revenue: 'not-a-number', currency: 'USD' },
  { revenue: 19.99, currency: true },
  { revenue: 19.99, currency: '   ' },
])('does not write malformed or non-positive revenue: %o', async eventData => {
  await event(eventData);

  expect(saveRevenueMock).not.toHaveBeenCalled();
  expect(saveEventDataMock).toHaveBeenCalledOnce();
});
