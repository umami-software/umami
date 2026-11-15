import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { DELETE } from './route';

const mocks = vi.hoisted(() => ({
  deleteApiKey: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma/apiKey', () => ({
  deleteApiKey: mocks.deleteApiKey,
}));

const parseRequestMock = vi.mocked(parseRequest);

function deleteRequest(keyId = 'key-1') {
  return DELETE(new Request(`http://localhost/api/me/api-keys/${keyId}`, { method: 'DELETE' }), {
    params: Promise.resolve({ keyId }),
  });
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  parseRequestMock.mockReset();
  mocks.deleteApiKey.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    error: undefined,
  });
});

test('DELETE removes a key owned by the current user', async () => {
  mocks.deleteApiKey.mockResolvedValue(1);

  const response = await deleteRequest();

  expect(response.status).toBe(200);
  expect(mocks.deleteApiKey).toHaveBeenCalledWith('key-1', 'user-1');
});

test('DELETE returns 404 when the key does not belong to the user', async () => {
  mocks.deleteApiKey.mockResolvedValue(0);

  const response = await deleteRequest('someone-elses-key');

  expect(response.status).toBe(404);
});

test('DELETE returns 404 in cloud mode', async () => {
  vi.stubEnv('CLOUD_MODE', '1');

  const response = await deleteRequest();

  expect(response.status).toBe(404);
  expect(mocks.deleteApiKey).not.toHaveBeenCalled();
});
