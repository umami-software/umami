import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { getUser, updateUser } from '@/queries/prisma/user';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getUserMock = vi.mocked(getUser);
const updateUserMock = vi.mocked(updateUser);

beforeEach(() => {
  parseRequestMock.mockReset();
  getUserMock.mockReset();
  updateUserMock.mockReset();
});

// The user can be deleted after the request was authenticated.
test('POST returns 404 when the user no longer exists', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'deleted-user' } },
    body: { currentPassword: 'old-password', newPassword: 'new-password' },
    error: undefined,
  } as any);
  getUserMock.mockResolvedValue(null);

  const response = await POST(new Request('http://localhost/api/me/password', { method: 'POST' }));

  expect(response.status).toBe(404);
  expect(updateUserMock).not.toHaveBeenCalled();
});
