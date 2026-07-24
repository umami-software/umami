import { beforeEach, expect, test, vi } from 'vitest';
import { isRelationalOnly } from '@/lib/db';
import { parseRequest } from '@/lib/request';
import { canDeleteWebsite, canViewWebsiteSection } from '@/permissions';
import { deleteSession } from '@/queries/prisma';
import { getLinkedDistinctIds, getLinkedSessionIds, getWebsiteSession } from '@/queries/sql';
import { DELETE, GET } from './route';

vi.mock('@/lib/db', () => ({
  isRelationalOnly: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canDeleteWebsite: vi.fn(),
  canViewWebsiteSection: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  deleteSession: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getLinkedDistinctIds: vi.fn(),
  getLinkedSessionIds: vi.fn(),
  getWebsiteSession: vi.fn(),
}));

const isRelationalOnlyMock = vi.mocked(isRelationalOnly);
const parseRequestMock = vi.mocked(parseRequest);
const canDeleteWebsiteMock = vi.mocked(canDeleteWebsite);
const canViewWebsiteSectionMock = vi.mocked(canViewWebsiteSection);
const deleteSessionMock = vi.mocked(deleteSession);
const getLinkedDistinctIdsMock = vi.mocked(getLinkedDistinctIds);
const getLinkedSessionIdsMock = vi.mocked(getLinkedSessionIds);
const getWebsiteSessionMock = vi.mocked(getWebsiteSession);

beforeEach(() => {
  isRelationalOnlyMock.mockReset();
  parseRequestMock.mockReset();
  canDeleteWebsiteMock.mockReset();
  canViewWebsiteSectionMock.mockReset();
  deleteSessionMock.mockReset();
  getLinkedDistinctIdsMock.mockReset();
  getLinkedSessionIdsMock.mockReset();
  getWebsiteSessionMock.mockReset();
});

test('GET returns not found when the session does not exist', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  canViewWebsiteSectionMock.mockResolvedValue(true);
   isRelationalOnlyMock.mockReturnValue(true);
   canDeleteWebsiteMock.mockResolvedValue(false);
  getWebsiteSessionMock.mockResolvedValue(undefined);

  const response = await GET(
    new Request('http://localhost/api/websites/website-1/sessions/missing-session'),
    {
      params: Promise.resolve({ websiteId: 'website-1', sessionId: 'missing-session' }),
    },
  );

  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'not-found', status: 404 },
  });
  expect(getLinkedDistinctIdsMock).not.toHaveBeenCalled();
  expect(getLinkedSessionIdsMock).not.toHaveBeenCalled();
});

test('GET includes canDelete when relational storage and delete permission are available', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  canViewWebsiteSectionMock.mockResolvedValue(true);
  isRelationalOnlyMock.mockReturnValue(true);
  canDeleteWebsiteMock.mockResolvedValue(true);
  getWebsiteSessionMock.mockResolvedValue({
    id: 'session-1',
    distinctId: 'distinct-1',
  });
  getLinkedSessionIdsMock.mockResolvedValue([
    { sessionId: 'session-2', createdAt: '2026-07-24T00:00:00.000Z' },
  ]);

  const response = await GET(
    new Request('http://localhost/api/websites/website-1/sessions/session-1'),
    {
      params: Promise.resolve({ websiteId: 'website-1', sessionId: 'session-1' }),
    },
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    id: 'session-1',
    canDelete: true,
    stitchedSessionCount: 2,
  });
});

test('DELETE rejects session deletion for non-relational storage', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  isRelationalOnlyMock.mockReturnValue(false);

  const response = await DELETE(
    new Request('http://localhost/api/websites/website-1/sessions/session-1', { method: 'DELETE' }),
    {
      params: Promise.resolve({ websiteId: 'website-1', sessionId: 'session-1' }),
    },
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'bad-request' },
  });
  expect(canDeleteWebsiteMock).not.toHaveBeenCalled();
  expect(deleteSessionMock).not.toHaveBeenCalled();
});

test('DELETE returns unauthorized when the user cannot delete the website', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  isRelationalOnlyMock.mockReturnValue(true);
  canDeleteWebsiteMock.mockResolvedValue(false);

  const response = await DELETE(
    new Request('http://localhost/api/websites/website-1/sessions/session-1', { method: 'DELETE' }),
    {
      params: Promise.resolve({ websiteId: 'website-1', sessionId: 'session-1' }),
    },
  );

  expect(response.status).toBe(401);
  expect(deleteSessionMock).not.toHaveBeenCalled();
});

test('DELETE returns not found when the session does not exist', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  isRelationalOnlyMock.mockReturnValue(true);
  canDeleteWebsiteMock.mockResolvedValue(true);
  deleteSessionMock.mockResolvedValue(null);

  const response = await DELETE(
    new Request('http://localhost/api/websites/website-1/sessions/missing-session', {
      method: 'DELETE',
    }),
    {
      params: Promise.resolve({ websiteId: 'website-1', sessionId: 'missing-session' }),
    },
  );

  expect(response.status).toBe(404);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'not-found', status: 404 },
  });
});

test('DELETE removes the session when the request is valid', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  isRelationalOnlyMock.mockReturnValue(true);
  canDeleteWebsiteMock.mockResolvedValue(true);
  deleteSessionMock.mockResolvedValue({ id: 'session-1' });

  const response = await DELETE(
    new Request('http://localhost/api/websites/website-1/sessions/session-1', { method: 'DELETE' }),
    {
      params: Promise.resolve({ websiteId: 'website-1', sessionId: 'session-1' }),
    },
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
  expect(deleteSessionMock).toHaveBeenCalledWith('website-1', 'session-1');
});
