import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findChallenge: vi.fn(),
  deleteChallenges: vi.fn(),
  upsertChallenge: vi.fn(),
  parseSecureToken: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      webAuthnChallenge: {
        findUnique: mocks.findChallenge,
        deleteMany: mocks.deleteChallenges,
        upsert: mocks.upsertChallenge,
      },
    },
  },
}));

vi.mock('@/lib/jwt', () => ({
  parseSecureToken: mocks.parseSecureToken,
}));

vi.mock('@/lib/auth', () => ({
  getBearerToken: (request: Request) => request.headers.get('authorization')?.split(' ')[1],
}));

vi.mock('@/lib/crypto', () => ({
  secret: () => 'app-secret',
}));

import { consumeChallenge, getPartialAuthUserId, getRelyingParty, saveChallenge } from './webauthn';

beforeEach(() => {
  vi.unstubAllEnvs();
  mocks.findChallenge.mockReset();
  mocks.deleteChallenges.mockReset();
  mocks.upsertChallenge.mockReset();
  mocks.parseSecureToken.mockReset();
});

describe('getRelyingParty', () => {
  test('derives the relying party from the request host by default', () => {
    vi.stubEnv('WEBAUTHN_ORIGIN', '');
    vi.stubEnv('WEBAUTHN_RP_ID', '');
    vi.stubEnv('WEBAUTHN_RP_NAME', '');

    const request = new Request('http://internal:3000/api/2fa/security-keys/register/options', {
      headers: { 'x-forwarded-host': 'analytics.example.com', 'x-forwarded-proto': 'https' },
    });

    expect(getRelyingParty(request)).toEqual({
      rpID: 'analytics.example.com',
      rpName: 'Umami',
      origin: ['https://analytics.example.com'],
    });
  });

  test('uses http for localhost', () => {
    vi.stubEnv('WEBAUTHN_ORIGIN', '');
    vi.stubEnv('WEBAUTHN_RP_ID', '');

    const request = new Request('http://localhost:3000/api', {
      headers: { host: 'localhost:3000' },
    });

    expect(getRelyingParty(request)).toMatchObject({
      rpID: 'localhost',
      origin: ['http://localhost:3000'],
    });
  });

  test('reads the relying party from environment variables', () => {
    vi.stubEnv('WEBAUTHN_ORIGIN', 'https://umami.example.com/, https://stats.example.com');
    vi.stubEnv('WEBAUTHN_RP_ID', 'example.com');
    vi.stubEnv('WEBAUTHN_RP_NAME', 'Example Analytics');

    const request = new Request('http://localhost:3000/api', {
      headers: { host: 'localhost:3000' },
    });

    expect(getRelyingParty(request)).toEqual({
      rpID: 'example.com',
      rpName: 'Example Analytics',
      origin: ['https://umami.example.com', 'https://stats.example.com'],
    });
  });

  test('derives the relying party ID from the first configured origin', () => {
    vi.stubEnv('WEBAUTHN_ORIGIN', 'https://umami.example.com');
    vi.stubEnv('WEBAUTHN_RP_ID', '');

    const request = new Request('http://localhost:3000/api');

    expect(getRelyingParty(request).rpID).toBe('umami.example.com');
  });
});

describe('getPartialAuthUserId', () => {
  test('returns the user ID from a partial sign-in token', () => {
    mocks.parseSecureToken.mockReturnValue({ userId: 'user-1', type: 'partial-auth' });

    const request = new Request('http://localhost/api', {
      headers: { authorization: 'Bearer partial-token' },
    });

    expect(getPartialAuthUserId(request)).toBe('user-1');
    expect(mocks.parseSecureToken).toHaveBeenCalledWith('partial-token', 'app-secret');
  });

  test('rejects full authentication tokens', () => {
    mocks.parseSecureToken.mockReturnValue({ userId: 'user-1', role: 'admin' });

    const request = new Request('http://localhost/api', {
      headers: { authorization: 'Bearer full-token' },
    });

    expect(getPartialAuthUserId(request)).toBeNull();
  });

  test('returns null without a token', () => {
    expect(getPartialAuthUserId(new Request('http://localhost/api'))).toBeNull();
    expect(mocks.parseSecureToken).not.toHaveBeenCalled();
  });
});

describe('challenges', () => {
  test('saveChallenge replaces the pending challenge for the user and type', async () => {
    await saveChallenge('user-1', 'registration', 'challenge-1');

    expect(mocks.upsertChallenge).toHaveBeenCalledWith({
      where: { userId_type: { userId: 'user-1', type: 'registration' } },
      update: { challenge: 'challenge-1', expiresAt: expect.any(Date) },
      create: {
        userId: 'user-1',
        type: 'registration',
        challenge: 'challenge-1',
        expiresAt: expect.any(Date),
      },
    });
  });

  test('consumeChallenge returns and deletes a pending challenge', async () => {
    mocks.findChallenge.mockResolvedValue({
      id: 'c-1',
      challenge: 'challenge-1',
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.deleteChallenges.mockResolvedValue({ count: 1 });

    await expect(consumeChallenge('user-1', 'authentication')).resolves.toBe('challenge-1');
    expect(mocks.deleteChallenges).toHaveBeenCalledWith({
      where: { id: 'c-1', challenge: 'challenge-1' },
    });
  });

  test('consumeChallenge returns null when another request already used the challenge', async () => {
    mocks.findChallenge.mockResolvedValue({
      id: 'c-1',
      challenge: 'challenge-1',
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.deleteChallenges.mockResolvedValue({ count: 0 });

    await expect(consumeChallenge('user-1', 'authentication')).resolves.toBeNull();
  });

  test('consumeChallenge returns null for an expired challenge', async () => {
    mocks.findChallenge.mockResolvedValue({
      id: 'c-1',
      challenge: 'challenge-1',
      expiresAt: new Date(Date.now() - 1000),
    });
    mocks.deleteChallenges.mockResolvedValue({ count: 1 });

    await expect(consumeChallenge('user-1', 'authentication')).resolves.toBeNull();
  });

  test('consumeChallenge returns null when there is no pending challenge', async () => {
    mocks.findChallenge.mockResolvedValue(null);

    await expect(consumeChallenge('user-1', 'registration')).resolves.toBeNull();
    expect(mocks.deleteChallenges).not.toHaveBeenCalled();
  });
});
