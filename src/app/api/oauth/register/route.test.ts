import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  createOauthClient: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma/oauth', () => ({
  createOauthClient: mocks.createOauthClient,
}));

vi.mock('@/lib/crypto', () => ({
  uuid: () => 'client-id',
}));

vi.mock('@/lib/redis', () => ({
  default: { enabled: false, client: {} },
}));

import { resetRateLimits } from '@/lib/rate-limit';
import { POST } from './route';

const body = {
  client_name: 'Test client',
  redirect_uris: ['http://127.0.0.1:3000/callback'],
};

function register(ip: string) {
  return POST(
    new Request('https://umami.example/api/oauth/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': ip, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  resetRateLimits();
  delete process.env.OAUTH_DISABLED;
  delete process.env.OAUTH_DISABLE_DCR;
  delete process.env.DISABLE_LOGIN;

  mocks.parseRequest.mockReset();
  mocks.createOauthClient.mockReset();

  mocks.parseRequest.mockResolvedValue({ body });
  mocks.createOauthClient.mockImplementation(async input => ({
    ...input,
    createdAt: new Date(),
  }));
});

test('limits registrations per source address without affecting other sources', async () => {
  for (let i = 0; i < 20; i++) {
    expect((await register('203.0.113.1')).status).toBe(201);
  }

  const limited = await register('203.0.113.1');

  expect(limited.status).toBe(429);
  await expect(limited.json()).resolves.toMatchObject({ error: 'temporarily_unavailable' });

  expect((await register('203.0.113.2')).status).toBe(201);
  expect(mocks.createOauthClient).toHaveBeenCalledTimes(21);
});
