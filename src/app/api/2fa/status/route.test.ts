import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { GET } from './route';

const KEY = 'a'.repeat(64);
const mocks = vi.hoisted(() => ({
  findTwoFactorAuth: vi.fn(),
  findAppSetting: vi.fn(),
  findUser: vi.fn(),
  findTeamUsers: vi.fn(),
  findTeams: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findTwoFactorAuth,
      },
      appSetting: {
        findUnique: mocks.findAppSetting,
      },
      user: {
        findUnique: mocks.findUser,
      },
      teamUser: {
        findMany: mocks.findTeamUsers,
      },
      team: {
        findMany: mocks.findTeams,
      },
    },
  },
}));

const parseRequestMock = vi.mocked(parseRequest);

beforeEach(() => {
  vi.unstubAllEnvs();
  parseRequestMock.mockReset();
  mocks.findTwoFactorAuth.mockReset();
  mocks.findAppSetting.mockReset();
  mocks.findUser.mockReset();
  mocks.findTeamUsers.mockReset();
  mocks.findTeams.mockReset();

  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'user-1',
      },
    },
    error: undefined,
  });
  mocks.findTwoFactorAuth.mockResolvedValue(null as any);
  mocks.findAppSetting.mockResolvedValue({
    key: 'twoFactorRequiredGlobal',
    value: 'true',
  } as any);
  mocks.findUser.mockResolvedValue({ twoFactorRequired: false } as any);
  mocks.findTeamUsers.mockResolvedValue([] as any);
  mocks.findTeams.mockResolvedValue([] as any);
});

test('GET requires 2FA when it is globally enabled', async () => {
  vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', KEY);

  const response = await GET(new Request('http://localhost/api/2fa/status'));

  await expect(response.json()).resolves.toEqual({
    isEnabled: false,
    isRequired: true,
    isConfigured: true,
    globalRequired: true,
    requiredReason: 'global',
  });
  expect(response.status).toBe(200);
});

test('GET does not require 2FA when the encryption key is missing', async () => {
  vi.stubEnv('TWO_FACTOR_ENCRYPTION_KEY', '');

  const response = await GET(new Request('http://localhost/api/2fa/status'));

  await expect(response.json()).resolves.toEqual({
    isEnabled: false,
    isRequired: false,
    isConfigured: false,
    globalRequired: true,
    requiredReason: null,
  });
  expect(response.status).toBe(200);
});
