import { beforeEach, expect, test, vi } from 'vitest';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { canViewWebsiteSection } from '@/permissions';
import { getWebsiteStats } from '@/queries/sql';
import { analyticsQuerySchema, websiteStatsQuerySchema } from '../analytics-schema';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getWebsiteStats: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getQueryFiltersMock = vi.mocked(getQueryFilters);
const canViewWebsiteSectionMock = vi.mocked(canViewWebsiteSection);
const getWebsiteStatsMock = vi.mocked(getWebsiteStats);

const stats = { pageviews: 10, visitors: 4, visits: 5, bounces: 1, totaltime: 120 };
const comparisonStats = { pageviews: 8, visitors: 3, visits: 4, bounces: 2, totaltime: 90 };

const startDate = new Date('2026-11-13T00:00:00.000Z');
const endDate = new Date('2026-11-19T23:59:59.999Z');

beforeEach(() => {
  parseRequestMock.mockReset();
  getQueryFiltersMock.mockReset();
  canViewWebsiteSectionMock.mockReset();
  getWebsiteStatsMock.mockReset();

  parseRequestMock.mockResolvedValue({ auth: {}, query: {}, error: undefined } as any);
  canViewWebsiteSectionMock.mockResolvedValue(true);
  getWebsiteStatsMock
    .mockResolvedValueOnce(stats as any)
    .mockResolvedValueOnce(comparisonStats as any);
});

function getStats() {
  return GET(new Request('http://localhost/api/websites/website-1/stats'), {
    params: Promise.resolve({ websiteId: 'website-1' }),
  });
}

test('includes the previous period comparison by default', async () => {
  getQueryFiltersMock.mockResolvedValue({ startDate, endDate } as any);

  const response = await getStats();

  expect(getWebsiteStatsMock).toHaveBeenCalledTimes(2);
  expect(await response.json()).toEqual({ ...stats, comparison: comparisonStats });
});

test('skips the comparison query when compare is none', async () => {
  getQueryFiltersMock.mockResolvedValue({ startDate, endDate, compare: 'none' } as any);

  const response = await getStats();

  expect(getWebsiteStatsMock).toHaveBeenCalledTimes(1);
  expect(await response.json()).toEqual(stats);
});

test('accepts compare=none only on the stats query schema', () => {
  const query = { startAt: '1763000000000', endAt: '1763600000000', compare: 'none' };

  expect(websiteStatsQuerySchema.safeParse(query).success).toBe(true);
  expect(analyticsQuerySchema.safeParse(query).success).toBe(false);
});
