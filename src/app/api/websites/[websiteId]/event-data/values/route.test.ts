import { beforeEach, expect, test, vi } from 'vitest';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { canViewWebsiteSection } from '@/permissions';
import { getEventDataValues } from '@/queries/sql';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getEventDataValues: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getQueryFiltersMock = vi.mocked(getQueryFilters);
const canViewWebsiteSectionMock = vi.mocked(canViewWebsiteSection);
const getEventDataValuesMock = vi.mocked(getEventDataValues);

beforeEach(() => {
  parseRequestMock.mockReset();
  getQueryFiltersMock.mockReset();
  canViewWebsiteSectionMock.mockReset();
  getEventDataValuesMock.mockReset();
});

test('uses eventName as the explicit event selector and leaves event filter expressions intact', async () => {
  const query = {
    startAt: 1786986000000,
    endAt: 1787075999999,
    event: 'eq.revenue-demo',
    eventName: 'revenue-demo',
    propertyName: 'currency',
    dataType: 1,
  };
  const filters = { startDate: new Date('2026-08-17T07:00:00.000Z') };

  parseRequestMock.mockResolvedValue({ auth: {}, query, error: undefined });
  canViewWebsiteSectionMock.mockResolvedValue(true);
  getQueryFiltersMock.mockResolvedValue(filters as any);
  getEventDataValuesMock.mockResolvedValue([{ value: 'USD', total: 1 }] as any);

  const response = await GET(
    new Request(
      'http://localhost/api/websites/website-1/event-data/values?event=eq.revenue-demo&eventName=revenue-demo&propertyName=currency&dataType=1',
    ),
    {
      params: Promise.resolve({ websiteId: 'website-1' }),
    },
  );

  expect(getQueryFiltersMock).toHaveBeenCalledWith(query, 'website-1');
  expect(getEventDataValuesMock).toHaveBeenCalledWith('website-1', 'revenue-demo', {
    ...filters,
    propertyName: 'currency',
    dataType: 1,
  });
  expect(response.status).toBe(200);
});

test('does not treat event filter expressions as exact event names when eventName is omitted', async () => {
  const query = {
    startAt: 1786986000000,
    endAt: 1787075999999,
    event: 'eq.revenue-demo',
    propertyName: 'currency',
    dataType: 1,
  };
  const filters = { startDate: new Date('2026-08-17T07:00:00.000Z') };

  parseRequestMock.mockResolvedValue({ auth: {}, query, error: undefined });
  canViewWebsiteSectionMock.mockResolvedValue(true);
  getQueryFiltersMock.mockResolvedValue(filters as any);
  getEventDataValuesMock.mockResolvedValue([{ value: 'USD', total: 1 }] as any);

  await GET(
    new Request(
      'http://localhost/api/websites/website-1/event-data/values?event=eq.revenue-demo&propertyName=currency&dataType=1',
    ),
    {
      params: Promise.resolve({ websiteId: 'website-1' }),
    },
  );

  expect(getEventDataValuesMock).toHaveBeenCalledWith('website-1', undefined, {
    ...filters,
    propertyName: 'currency',
    dataType: 1,
  });
});
