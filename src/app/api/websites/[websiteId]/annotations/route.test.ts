import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canUpdateWebsite, canViewSharedWebsiteFilters } from '@/permissions';
import { createAnnotation, getWebsiteAnnotations } from '@/queries/prisma';
import { GET, POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canUpdateWebsite: vi.fn(),
  canViewSharedWebsiteFilters: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  createAnnotation: vi.fn(),
  getWebsiteAnnotations: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canUpdateWebsiteMock = vi.mocked(canUpdateWebsite);
const canViewSharedWebsiteFiltersMock = vi.mocked(canViewSharedWebsiteFilters);
const createAnnotationMock = vi.mocked(createAnnotation);
const getWebsiteAnnotationsMock = vi.mocked(getWebsiteAnnotations);

const params = Promise.resolve({ websiteId: 'website-1' });

beforeEach(() => {
  parseRequestMock.mockReset();
  canUpdateWebsiteMock.mockReset();
  canViewSharedWebsiteFiltersMock.mockReset();
  createAnnotationMock.mockReset();
  getWebsiteAnnotationsMock.mockReset();
});

test('POST validates the note and stores the annotation with the creating user', async () => {
  const date = new Date('2026-08-01T00:00:00.000Z');

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { date, allDay: false, note: 'Deployed v2' },
    error: undefined,
  } as any);
  canUpdateWebsiteMock.mockResolvedValue(true);
  createAnnotationMock.mockResolvedValue({ id: 'annotation-1' } as any);

  const response = await POST(
    new Request('http://localhost/api/websites/website-1/annotations', { method: 'POST' }),
    { params },
  );
  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean; data?: any };
  };

  expect(schema.safeParse({ date: '2026-08-01', note: '' }).success).toBe(false);
  expect(schema.safeParse({ date: '2026-08-01', note: 'x'.repeat(501) }).success).toBe(false);
  expect(schema.safeParse({ date: 'not-a-date', note: 'ok' }).success).toBe(false);

  const parsed = schema.safeParse({ date: '2026-08-01', note: 'ok' });
  expect(parsed.success).toBe(true);
  expect(parsed.data.allDay).toBe(true);

  expect(createAnnotationMock).toHaveBeenCalledWith({
    id: expect.any(String),
    websiteId: 'website-1',
    userId: 'user-1',
    date,
    allDay: false,
    note: 'Deployed v2',
  });
  expect(response.status).toBe(200);
});

test('POST rejects users without update permission', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { date: new Date(), allDay: true, note: 'nope' },
    error: undefined,
  } as any);
  canUpdateWebsiteMock.mockResolvedValue(false);

  const response = await POST(
    new Request('http://localhost/api/websites/website-1/annotations', { method: 'POST' }),
    { params },
  );

  expect(createAnnotationMock).not.toHaveBeenCalled();
  expect(response.status).toBe(401);
});

test('GET passes the date window through to the query only when both bounds are present', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    query: { startAt: 1000, endAt: 2000, search: 'deploy', page: 2, pageSize: 20 },
    error: undefined,
  } as any);
  canViewSharedWebsiteFiltersMock.mockResolvedValue(true);
  getWebsiteAnnotationsMock.mockResolvedValue({ data: [], count: 0 } as any);

  await GET(new Request('http://localhost/api/websites/website-1/annotations'), { params });

  expect(getWebsiteAnnotationsMock).toHaveBeenCalledWith('website-1', {
    search: 'deploy',
    page: 2,
    pageSize: 20,
    startDate: new Date(1000),
    endDate: new Date(2000),
  });

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    query: { page: 1 },
    error: undefined,
  } as any);

  await GET(new Request('http://localhost/api/websites/website-1/annotations'), { params });

  expect(getWebsiteAnnotationsMock).toHaveBeenLastCalledWith('website-1', {
    search: undefined,
    page: 1,
    pageSize: undefined,
  });
});
