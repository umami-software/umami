import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canViewBatchWebsites } from '@/permissions/website';
import { getWebsiteListCharts } from '@/queries/sql';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
  resolvePeriodDateRange: (query: any) => query,
}));

vi.mock('@/permissions/website', () => ({
  canViewBatchWebsites: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getWebsiteListCharts: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canViewBatchWebsitesMock = vi.mocked(canViewBatchWebsites);
const getWebsiteListChartsMock = vi.mocked(getWebsiteListCharts);

const websiteId = '00000000-0000-0000-0000-000000000001';

beforeEach(() => {
  vi.useFakeTimers();
  parseRequestMock.mockReset();
  canViewBatchWebsitesMock.mockReset();
  getWebsiteListChartsMock.mockReset();
  canViewBatchWebsitesMock.mockResolvedValue([websiteId]);
  getWebsiteListChartsMock.mockResolvedValue({});
});

afterEach(() => {
  vi.useRealTimers();
});

// The default range ends at the end of today; the hours still to come would
// otherwise be drawn as an empty bucket at the end of the sparkline
test('GET ends the default range now, not at the end of today', async () => {
  const now = new Date('2026-10-23T07:46:00Z');
  vi.setSystemTime(now);
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user' } },
    query: { ids: [websiteId], timezone: 'Europe/Berlin' },
    error: undefined,
  } as any);

  await GET(new Request('http://localhost/api/websites/charts'));

  const [, { startDate, endDate }] = getWebsiteListChartsMock.mock.calls[0];

  expect(startDate).toEqual(new Date('2026-10-15T22:00:00Z'));
  expect(endDate).toEqual(now);
});

test('GET keeps an explicit range that ends in the past', async () => {
  vi.setSystemTime(new Date('2026-10-23T07:46:00Z'));
  const startAt = Date.parse('2026-10-01T00:00:00Z');
  const endAt = Date.parse('2026-10-07T23:59:59Z');
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user' } },
    query: { ids: [websiteId], timezone: 'UTC', startAt, endAt },
    error: undefined,
  } as any);

  await GET(new Request('http://localhost/api/websites/charts'));

  const [, { endDate }] = getWebsiteListChartsMock.mock.calls[0];

  expect(endDate).toEqual(new Date(endAt));
});
