import { beforeEach, expect, test, vi } from 'vitest';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { GET } from './route';

const KEY = 'a'.repeat(64);

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: vi.fn(),
      },
      appSetting: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      teamUser: {
        findMany: vi.fn(),
      },
      team: {
        findMany: vi.fn(),
      },
    },
  },
}));

const parseRequestMock = vi.mocked(parseRequest);
const prismaMock = vi.mocked(prisma, true);

beforeEach(() => {
  vi.unstubAllEnvs();
  parseRequestMock.mockReset();
  prismaMock.client.twoFactorAuth.findUnique.mockReset();
  prismaMock.client.appSetting.findUnique.mockReset();
  prismaMock.client.user.findUnique.mockReset();
  prismaMock.client.teamUser.findMany.mockReset();
  prismaMock.client.team.findMany.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'user-1',
      },
    },
    error: undefined,
  });
  prismaMock.client.twoFactorAuth.findUnique.mockResolvedValue(null as any);
  prismaMock.client.appSetting.findUnique.mockResolvedValue({
    key: 'twoFactorRequiredGlobal',
    value: 'true',
  } as any);
  prismaMock.client.user.findUnique.mockResolvedValue({ twoFactorRequired: false } as any);
  prismaMock.client.teamUser.findMany.mockResolvedValue([] as any);
  prismaMock.client.team.findMany.mockResolvedValue([] as any);
});

test('GET requires 2FA when it is globally enabled', async () => {
  vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', KEY);

  const response = await GET(new Request('http://localhost/api/2fa/status'));

  await expect(response.json()).resolves.toEqual({
    isEnabled: false,
    isRequired: true,
    requiredReason: 'global',
  });
  expect(response.status).toBe(200);
});

test('GET does not require 2FA when the encryption key is missing', async () => {
  vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', '');

  const response = await GET(new Request('http://localhost/api/2fa/status'));

  expect(prismaMock.client.appSetting.findUnique).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toEqual({
    isEnabled: false,
    isRequired: false,
    requiredReason: null,
  });
  expect(response.status).toBe(200);
});
