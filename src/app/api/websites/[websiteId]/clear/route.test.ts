import { beforeEach, expect, test, vi } from 'vitest';
import { isRelationalOnly } from '@/lib/db';
import { parseRequest } from '@/lib/request';
import { canDeleteWebsite } from '@/permissions';
import { clearWebsiteData, getWebsiteDataCounts } from '@/queries/prisma';
import { websiteDataRangeSchema } from '../../request-schema';
import { GET, POST } from './route';

vi.mock('@/lib/db', () => ({
  isRelationalOnly: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canDeleteWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  clearWebsiteData: vi.fn(),
  getWebsiteDataCounts: vi.fn(),
}));

const isRelationalOnlyMock = vi.mocked(isRelationalOnly);
const parseRequestMock = vi.mocked(parseRequest);
const canDeleteWebsiteMock = vi.mocked(canDeleteWebsite);
const clearWebsiteDataMock = vi.mocked(clearWebsiteData);
const getWebsiteDataCountsMock = vi.mocked(getWebsiteDataCounts);

const counts = { events: 40, eventData: 7, sessions: 2, revenue: 3, replays: 1, heatmaps: 4 };
const startAt = Date.UTC(2026, 8, 1);
const endAt = Date.UTC(2026, 9, 1);
const context = { params: Promise.resolve({ websiteId: 'website-1' }) };

beforeEach(() => {
  isRelationalOnlyMock.mockReset();
  parseRequestMock.mockReset();
  canDeleteWebsiteMock.mockReset();
  clearWebsiteDataMock.mockReset();
  getWebsiteDataCountsMock.mockReset();
  isRelationalOnlyMock.mockReturnValue(true);
  canDeleteWebsiteMock.mockResolvedValue(true);
});

test('schema rejects a range whose start is not before its end', () => {
  expect(websiteDataRangeSchema.safeParse({ startAt: endAt, endAt: startAt }).success).toBe(false);
  expect(websiteDataRangeSchema.safeParse({ startAt, endAt: startAt }).success).toBe(false);
  expect(websiteDataRangeSchema.safeParse({ startAt: 'x', endAt }).success).toBe(false);
  expect(websiteDataRangeSchema.safeParse({ startAt, endAt: 1e16 }).success).toBe(false);
  // JSON values that z.coerce would have turned into 0, deleting from the epoch.
  for (const value of [null, '', false, [], '1.5', '-1']) {
    expect(websiteDataRangeSchema.safeParse({ startAt: value, endAt }).success).toBe(false);
  }
  expect(
    websiteDataRangeSchema.safeParse({ startAt: `${startAt}`, endAt: `${endAt}` }).data,
  ).toEqual({ startAt, endAt });
});

test('GET returns the parse error', async () => {
  parseRequestMock.mockResolvedValue({ error: () => Response.json({}, { status: 400 }) });

  const response = await GET(new Request('http://localhost/api/websites/website-1/clear'), context);

  expect(response.status).toBe(400);
  expect(getWebsiteDataCountsMock).not.toHaveBeenCalled();
});

test('GET returns bad request without relational storage', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, query: { startAt, endAt } });
  isRelationalOnlyMock.mockReturnValue(false);

  const response = await GET(new Request('http://localhost/api/websites/website-1/clear'), context);

  expect(response.status).toBe(400);
  expect(getWebsiteDataCountsMock).not.toHaveBeenCalled();
});

test('GET returns unauthorized without delete permission', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, query: { startAt, endAt } });
  canDeleteWebsiteMock.mockResolvedValue(false);

  const response = await GET(new Request('http://localhost/api/websites/website-1/clear'), context);

  expect(response.status).toBe(401);
  expect(getWebsiteDataCountsMock).not.toHaveBeenCalled();
});

test('GET returns preview counts', async () => {
  parseRequestMock.mockResolvedValue({ auth: { user: {} }, query: { startAt, endAt } });
  getWebsiteDataCountsMock.mockResolvedValue(counts);

  const response = await GET(new Request('http://localhost/api/websites/website-1/clear'), context);

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(counts);
  expect(canDeleteWebsiteMock).toHaveBeenCalledWith({ user: {} }, 'website-1');
  expect(getWebsiteDataCountsMock).toHaveBeenCalledWith(
    'website-1',
    new Date(startAt),
    new Date(endAt),
  );
});

test('POST returns bad request without relational storage', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, body: { startAt, endAt } });
  isRelationalOnlyMock.mockReturnValue(false);

  const response = await POST(
    new Request('http://localhost/api/websites/website-1/clear', { method: 'POST' }),
    context,
  );

  expect(response.status).toBe(400);
  expect(clearWebsiteDataMock).not.toHaveBeenCalled();
});

test('POST returns unauthorized without delete permission', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, body: { startAt, endAt } });
  canDeleteWebsiteMock.mockResolvedValue(false);

  const response = await POST(
    new Request('http://localhost/api/websites/website-1/clear', { method: 'POST' }),
    context,
  );

  expect(response.status).toBe(401);
  expect(clearWebsiteDataMock).not.toHaveBeenCalled();
});

test('POST deletes the range and returns deleted counts', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, body: { startAt, endAt } });
  clearWebsiteDataMock.mockResolvedValue(counts);

  const response = await POST(
    new Request('http://localhost/api/websites/website-1/clear', { method: 'POST' }),
    context,
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(counts);
  expect(clearWebsiteDataMock).toHaveBeenCalledWith(
    'website-1',
    new Date(startAt),
    new Date(endAt),
  );
});
