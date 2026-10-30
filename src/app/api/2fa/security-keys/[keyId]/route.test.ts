import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { DELETE } from './route';

const mocks = vi.hoisted(() => ({
  deleteSecurityKey: vi.fn(),
  getUserSecurityKeyCount: vi.fn(),
  isTwoFactorConfigured: vi.fn(),
  isTwoFactorRequired: vi.fn(),
  findTwoFactorAuth: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma/securityKey', () => ({
  deleteSecurityKey: mocks.deleteSecurityKey,
  getUserSecurityKeyCount: mocks.getUserSecurityKeyCount,
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  isTwoFactorConfigured: mocks.isTwoFactorConfigured,
}));

vi.mock('@/lib/two-factor/requirement', () => ({
  isTwoFactorRequired: mocks.isTwoFactorRequired,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findTwoFactorAuth,
      },
    },
  },
}));

const parseRequestMock = vi.mocked(parseRequest);

function deleteRequest(keyId = 'key-1') {
  return DELETE(
    new Request(`http://localhost/api/2fa/security-keys/${keyId}`, { method: 'DELETE' }),
    { params: Promise.resolve({ keyId }) },
  );
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  parseRequestMock.mockReset();
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    error: undefined,
  });
  mocks.isTwoFactorConfigured.mockReturnValue(true);
  mocks.isTwoFactorRequired.mockResolvedValue(false);
  mocks.findTwoFactorAuth.mockResolvedValue(null);
  mocks.getUserSecurityKeyCount.mockResolvedValue(1);
  mocks.deleteSecurityKey.mockResolvedValue(1);
});

test('DELETE removes a security key owned by the current user', async () => {
  const response = await deleteRequest();

  expect(response.status).toBe(200);
  expect(mocks.deleteSecurityKey).toHaveBeenCalledWith('key-1', 'user-1');
});

test('DELETE returns 404 when the key does not belong to the user', async () => {
  mocks.deleteSecurityKey.mockResolvedValue(0);

  const response = await deleteRequest('someone-elses-key');

  expect(response.status).toBe(404);
});

test('DELETE refuses to remove the last second factor while 2FA is required', async () => {
  mocks.isTwoFactorRequired.mockResolvedValue(true);

  const response = await deleteRequest();

  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'security-key-error-remove-not-allowed' },
  });
  expect(mocks.deleteSecurityKey).not.toHaveBeenCalled();
});

test('DELETE allows removing a key while 2FA is required if another factor remains', async () => {
  mocks.isTwoFactorRequired.mockResolvedValue(true);
  mocks.findTwoFactorAuth.mockResolvedValue({ isEnabled: true });

  const response = await deleteRequest();

  expect(response.status).toBe(200);
  expect(mocks.deleteSecurityKey).toHaveBeenCalledWith('key-1', 'user-1');
});

test('DELETE returns 404 in cloud mode', async () => {
  vi.stubEnv('CLOUD_MODE', '1');

  const response = await deleteRequest();

  expect(response.status).toBe(404);
  expect(mocks.deleteSecurityKey).not.toHaveBeenCalled();
});
