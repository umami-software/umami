import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { canViewWebsiteSection } from '@/permissions';
import { getWebsiteEventStats } from '@/queries/sql/events/getWebsiteEventStats';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
  getQueryFilters: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(),
}));

vi.mock('@/queries/sql/events/getWebsiteEventStats', () => ({
  getWebsiteEventStats: vi.fn(),
}));

const getQueryFiltersMock = vi.mocked(getQueryFilters);
const canViewMock = vi.mocked(canViewWebsiteSection);
const statsMock = vi.mocked(getWebsiteEventStats);

const startDate = new Date('2026-01-08T00:00:00.000Z');
const endDate = new Date('2026-01-14T23:59:59.999Z');

function request(filters: Record<string, any>) {
  getQueryFiltersMock.mockResolvedValue(filters as any);

  return GET(new Request('http://localhost/api/websites/website-1/events/stats'), {
    params: Promise.resolve({ websiteId: 'website-1' }),
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-02-01T12:00:00.000Z'));
  vi.mocked(parseRequest).mockReset();
  getQueryFiltersMock.mockReset();
  canViewMock.mockReset();
  statsMock.mockReset();
  vi.mocked(parseRequest).mockResolvedValue({ auth: {}, query: {}, error: undefined } as any);
  canViewMock.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
});

test('returns the current stats with the previous period as comparison', async () => {
  // Results depend on the filters, not on the call order.
  statsMock.mockImplementation(async (_websiteId, filters) =>
    filters.startDate === startDate
      ? ({ events: 10, visitors: 4 } as any)
      : ({ events: 6, visitors: 3 } as any),
  );

  const filters = { startDate, endDate, eventType: 2 };
  const response = await request(filters);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    data: { events: 10, visitors: 4, comparison: { events: 6, visitors: 3 } },
  });
  expect(statsMock).toHaveBeenCalledTimes(2);
  expect(statsMock).toHaveBeenCalledWith('website-1', filters);
  expect(statsMock).toHaveBeenCalledWith('website-1', {
    eventType: 2,
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-07T23:59:59.999Z'),
  });
  expect(filters).toEqual({ startDate, endDate, eventType: 2 });
});

test('uses the same period one year earlier for yoy', async () => {
  statsMock.mockResolvedValue({} as any);

  await request({ startDate, endDate, compare: 'yoy' });

  expect(statsMock).toHaveBeenCalledWith('website-1', {
    compare: 'yoy',
    startDate: new Date('2025-01-08T00:00:00.000Z'),
    endDate: new Date('2025-01-14T23:59:59.999Z'),
  });
});

test('compares only the elapsed whole hours of a period that has not ended', async () => {
  statsMock.mockResolvedValue({} as any);
  vi.setSystemTime(new Date('2026-01-10T05:30:00.000Z'));

  await request({ startDate, endDate });

  expect(statsMock).toHaveBeenCalledWith('website-1', {
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-03T04:59:59.999Z'),
  });
});

test('starts the comparison query without waiting for the current period', async () => {
  let resolveCurrent: (value: any) => void = () => {};
  statsMock
    .mockReturnValueOnce(new Promise(resolve => (resolveCurrent = resolve)) as any)
    .mockResolvedValueOnce({ events: 1 } as any);

  const response = request({ startDate, endDate });

  await vi.waitFor(() => expect(statsMock).toHaveBeenCalledTimes(2));
  resolveCurrent({ events: 2 });

  expect(await (await response).json()).toEqual({
    data: { events: 2, comparison: { events: 1 } },
  });
});

test('rejects when one of the queries fails', async () => {
  statsMock.mockResolvedValueOnce({} as any).mockRejectedValueOnce(new Error('db down'));

  await expect(request({ startDate, endDate })).rejects.toThrow('db down');
});

test('runs no query when the caller cannot view the events section', async () => {
  canViewMock.mockResolvedValue(false);

  const response = await request({ startDate, endDate });

  expect(response.status).toBe(401);
  expect(canViewMock).toHaveBeenCalledWith({}, 'website-1', 'events');
  expect(statsMock).not.toHaveBeenCalled();
});
