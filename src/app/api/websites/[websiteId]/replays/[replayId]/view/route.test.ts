import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canViewAuthenticatedWebsite } from '@/permissions';
import { createReplayView } from '@/queries/prisma/sessionReplay';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canViewAuthenticatedWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma/sessionReplay', () => ({
  createReplayView: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canViewAuthenticatedWebsiteMock = vi.mocked(canViewAuthenticatedWebsite);
const createReplayViewMock = vi.mocked(createReplayView);

const params = Promise.resolve({ websiteId: 'website-1', replayId: 'visit-1' });

beforeEach(() => {
  parseRequestMock.mockReset();
  canViewAuthenticatedWebsiteMock.mockReset();
  createReplayViewMock.mockReset();
  parseRequestMock.mockResolvedValue({ auth: { user: { id: 'user-1' } }, error: undefined } as any);
});

test('POST records the view for the current user', async () => {
  canViewAuthenticatedWebsiteMock.mockResolvedValue(true);

  const response = await POST(new Request('http://localhost', { method: 'POST' }), { params });

  expect(response.status).toBe(200);
  expect(createReplayViewMock).toHaveBeenCalledWith('user-1', 'website-1', 'visit-1');
});

test('POST rejects users who cannot view the website', async () => {
  canViewAuthenticatedWebsiteMock.mockResolvedValue(false);

  const response = await POST(new Request('http://localhost', { method: 'POST' }), { params });

  expect(response.status).toBe(401);
  expect(createReplayViewMock).not.toHaveBeenCalled();
});
