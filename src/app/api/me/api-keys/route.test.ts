import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { GET, POST } from './route';

const mocks = vi.hoisted(() => ({
  createApiKey: vi.fn(),
  getUserApiKeys: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma/apiKey', () => ({
  createApiKey: mocks.createApiKey,
  getUserApiKeys: mocks.getUserApiKeys,
}));

const parseRequestMock = vi.mocked(parseRequest);

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  parseRequestMock.mockReset();
  mocks.createApiKey.mockReset();
  mocks.getUserApiKeys.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'CI pipeline' },
    error: undefined,
  });
});

test('GET returns the current user api keys', async () => {
  const keys = [{ id: 'key-1', name: 'CI pipeline', keyPrefix: 'umami_abcdefgh' }];
  mocks.getUserApiKeys.mockResolvedValue(keys as any);

  const response = await GET(new Request('http://localhost/api/me/api-keys'));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual(keys);
  expect(mocks.getUserApiKeys).toHaveBeenCalledWith('user-1');
});

test('GET returns 404 in cloud mode', async () => {
  vi.stubEnv('CLOUD_MODE', '1');

  const response = await GET(new Request('http://localhost/api/me/api-keys'));

  expect(response.status).toBe(404);
  expect(mocks.getUserApiKeys).not.toHaveBeenCalled();
});

test('GET returns the auth error when unauthenticated', async () => {
  parseRequestMock.mockResolvedValue({
    auth: null,
    error: () => new Response(null, { status: 401 }),
  });

  const response = await GET(new Request('http://localhost/api/me/api-keys'));

  expect(response.status).toBe(401);
});

test('POST creates a key, stores only the hash, and returns the plaintext once', async () => {
  mocks.createApiKey.mockImplementation(async data => ({
    id: data.id,
    name: data.name,
    keyPrefix: data.keyPrefix,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  }));

  const response = await POST(new Request('http://localhost/api/me/api-keys', { method: 'POST' }));

  expect(response.status).toBe(200);

  const body = await response.json();

  expect(body.key).toMatch(/^umami_[0-9a-zA-Z]{32}$/);
  expect(body.name).toBe('CI pipeline');
  expect(body.keyPrefix).toBe(body.key.slice(0, 14));
  expect(body).not.toHaveProperty('keyHash');

  const stored = mocks.createApiKey.mock.calls[0][0];

  expect(stored.userId).toBe('user-1');
  expect(stored.keyHash).not.toBe(body.key);
  expect(stored.keyHash).toHaveLength(128);
  expect(stored).not.toHaveProperty('key');
});

test('POST returns 404 in cloud mode', async () => {
  vi.stubEnv('CLOUD_MODE', '1');

  const response = await POST(new Request('http://localhost/api/me/api-keys', { method: 'POST' }));

  expect(response.status).toBe(404);
  expect(mocks.createApiKey).not.toHaveBeenCalled();
});
