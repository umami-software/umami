import { beforeEach, expect, test, vi } from 'vitest';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { canViewWebsiteSection } from '@/permissions';
import { getEventDataFields } from '@/queries/sql';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getEventDataFields: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getQueryFiltersMock = vi.mocked(getQueryFilters);
const canViewWebsiteSectionMock = vi.mocked(canViewWebsiteSection);
const getEventDataFieldsMock = vi.mocked(getEventDataFields);

beforeEach(() => {
  parseRequestMock.mockReset();
  getQueryFiltersMock.mockReset();
  canViewWebsiteSectionMock.mockReset();
  getEventDataFieldsMock.mockReset();
});

test('uses eventName as the explicit event selector for property fields', async () => {
  const query = {
    startAt: 1786986000000,
    endAt: 1787075999999,
    event: 'eq.revenue-demo',
    eventName: 'revenue-demo',
  };
  const filters = { startDate: new Date('2026-08-17T07:00:00.000Z') };

  parseRequestMock.mockResolvedValue({ auth: {}, query, error: undefined });
  canViewWebsiteSectionMock.mockResolvedValue(true);
  getQueryFiltersMock.mockResolvedValue(filters as any);
  getEventDataFieldsMock.mockResolvedValue([{ propertyName: 'currency', dataType: 1, total: 1 }] as any);

  const response = await GET(
    new Request(
      'http://localhost/api/websites/website-1/event-data/fields?event=eq.revenue-demo&eventName=revenue-demo',
    ),
    {
      params: Promise.resolve({ websiteId: 'website-1' }),
    },
  );

  expect(getQueryFiltersMock).toHaveBeenCalledWith(query, 'website-1');
  expect(getEventDataFieldsMock).toHaveBeenCalledWith('website-1', 'revenue-demo', filters);
  expect(response.status).toBe(200);
});
