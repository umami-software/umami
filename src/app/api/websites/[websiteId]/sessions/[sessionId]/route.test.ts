import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canViewWebsiteSection } from '@/permissions';
import { getLinkedDistinctIds, getLinkedSessionIds, getWebsiteSession } from '@/queries/sql';
import { GET } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canViewWebsiteSection: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  getLinkedDistinctIds: vi.fn(),
  getLinkedSessionIds: vi.fn(),
  getWebsiteSession: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canViewWebsiteSectionMock = vi.mocked(canViewWebsiteSection);
const getLinkedDistinctIdsMock = vi.mocked(getLinkedDistinctIds);
const getLinkedSessionIdsMock = vi.mocked(getLinkedSessionIds);
const getWebsiteSessionMock = vi.mocked(getWebsiteSession);

beforeEach(() => {
  parseRequestMock.mockReset();
  canViewWebsiteSectionMock.mockReset();
  getLinkedDistinctIdsMock.mockReset();
  getLinkedSessionIdsMock.mockReset();
  getWebsiteSessionMock.mockReset();
});

test('GET returns not found when the session does not exist', async () => {
  parseRequestMock.mockResolvedValue({ auth: {}, error: undefined });
  canViewWebsiteSectionMock.mockResolvedValue(true);
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
