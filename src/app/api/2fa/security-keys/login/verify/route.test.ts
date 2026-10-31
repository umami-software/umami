import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
  getPartialAuthUserId: vi.fn(),
  consumeChallenge: vi.fn(),
  getUser: vi.fn(),
  getAllUserTeams: vi.fn(),
  getSecurityKeyByCredentialId: vi.fn(),
  updateSecurityKeyUsage: vi.fn(),
  checkRateLimit: vi.fn(),
  recordFailedAttempt: vi.fn(),
  resetRateLimit: vi.fn(),
  createSecureToken: vi.fn(),
  saveAuth: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@simplewebauthn/server', () => ({
  verifyAuthenticationResponse: mocks.verifyAuthenticationResponse,
}));

vi.mock('@/lib/two-factor/webauthn', () => ({
  consumeChallenge: mocks.consumeChallenge,
  getPartialAuthUserId: mocks.getPartialAuthUserId,
  getRelyingParty: () => ({
    rpID: 'localhost',
    rpName: 'Umami',
    origin: ['http://localhost:3000'],
  }),
}));

vi.mock('@/lib/two-factor/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  recordFailedAttempt: mocks.recordFailedAttempt,
  resetRateLimit: mocks.resetRateLimit,
}));

vi.mock('@/queries/prisma', () => ({
  getAllUserTeams: mocks.getAllUserTeams,
  getUser: mocks.getUser,
}));

vi.mock('@/queries/prisma/securityKey', () => ({
  getSecurityKeyByCredentialId: mocks.getSecurityKeyByCredentialId,
  updateSecurityKeyUsage: mocks.updateSecurityKeyUsage,
}));

vi.mock('@/lib/auth', () => ({
  saveAuth: mocks.saveAuth,
}));

vi.mock('@/lib/crypto', () => ({
  hash: () => 'pwd-fingerprint',
  secret: () => 'app-secret',
}));

vi.mock('@/lib/jwt', () => ({
  createSecureToken: mocks.createSecureToken,
}));

vi.mock('@/lib/load', () => ({
  addTeamBillingStatus: async (teams: any[]) => teams,
}));

vi.mock('@/lib/redis', () => ({
  default: {
    enabled: false,
  },
}));

import { POST } from './route';

const authenticationResponse = {
  id: 'credential-1',
  rawId: 'credential-1',
  type: 'public-key',
  response: { clientDataJSON: 'client-data', authenticatorData: 'data', signature: 'sig' },
  clientExtensionResults: {},
};

function postRequest() {
  return POST(
    new Request('http://localhost/api/2fa/security-keys/login/verify', { method: 'POST' }),
  );
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }

  mocks.getPartialAuthUserId.mockReturnValue('user-1');
  mocks.parseRequest.mockResolvedValue({
    body: { response: authenticationResponse },
    error: undefined,
  });
  mocks.getUser.mockResolvedValue({
    id: 'user-1',
    username: 'alice',
    password: 'hashed-password',
    role: 'admin',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
  });
  mocks.getAllUserTeams.mockResolvedValue([]);
  mocks.checkRateLimit.mockResolvedValue({ allowed: true });
  mocks.recordFailedAttempt.mockResolvedValue({});
  mocks.consumeChallenge.mockResolvedValue('challenge-1');
  mocks.getSecurityKeyByCredentialId.mockResolvedValue({
    id: 'key-1',
    userId: 'user-1',
    credentialId: 'credential-1',
    publicKey: 'AQID',
    counter: BigInt(4),
    transports: ['usb'],
  });
  mocks.verifyAuthenticationResponse.mockResolvedValue({
    verified: true,
    authenticationInfo: { newCounter: 5 },
  });
  mocks.createSecureToken.mockReturnValue('auth-token');
});

test('POST exchanges a valid security key assertion for an auth token', async () => {
  const response = await postRequest();

  expect(response.status).toBe(200);
  expect(mocks.verifyAuthenticationResponse).toHaveBeenCalledWith({
    response: authenticationResponse,
    expectedChallenge: 'challenge-1',
    expectedOrigin: ['http://localhost:3000'],
    expectedRPID: 'localhost',
    credential: {
      id: 'credential-1',
      publicKey: new Uint8Array([1, 2, 3]),
      counter: 4,
      transports: ['usb'],
    },
    requireUserVerification: false,
  });
  expect(mocks.updateSecurityKeyUsage).toHaveBeenCalledWith('key-1', 5);
  expect(mocks.resetRateLimit).toHaveBeenCalledWith('user-1');
  expect(mocks.createSecureToken).toHaveBeenCalledWith(
    { userId: 'user-1', role: 'admin', pwd: 'pwd-fingerprint' },
    'app-secret',
  );
  await expect(response.json()).resolves.toMatchObject({
    token: 'auth-token',
    user: { id: 'user-1', username: 'alice', isAdmin: true, teams: [] },
  });
});

test('POST rejects requests without a partial sign-in token', async () => {
  mocks.getPartialAuthUserId.mockReturnValue(null);

  const response = await postRequest();

  expect(response.status).toBe(401);
  expect(mocks.consumeChallenge).not.toHaveBeenCalled();
});

test('POST rejects an assertion from a key registered to another user', async () => {
  mocks.getSecurityKeyByCredentialId.mockResolvedValue({
    id: 'key-2',
    userId: 'user-2',
    credentialId: 'credential-1',
    publicKey: 'AQID',
    counter: BigInt(0),
    transports: [],
  });

  const response = await postRequest();

  expect(response.status).toBe(400);
  expect(mocks.verifyAuthenticationResponse).not.toHaveBeenCalled();
  expect(mocks.recordFailedAttempt).toHaveBeenCalledWith('user-1');
  expect(mocks.createSecureToken).not.toHaveBeenCalled();
});

test('POST records a failed attempt when verification fails', async () => {
  mocks.verifyAuthenticationResponse.mockRejectedValue(new Error('Signature mismatch'));
  mocks.recordFailedAttempt.mockResolvedValue({ lockedUntil: '2026-10-30T12:00:00.000Z' });

  const response = await postRequest();

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'security-key-error-verification-failed',
      lockedUntil: '2026-10-30T12:00:00.000Z',
    },
  });
  expect(mocks.updateSecurityKeyUsage).not.toHaveBeenCalled();
  expect(mocks.createSecureToken).not.toHaveBeenCalled();
});

test('POST rejects an assertion without a pending challenge', async () => {
  mocks.consumeChallenge.mockResolvedValue(null);

  const response = await postRequest();

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'security-key-error-challenge-expired' },
  });
  expect(mocks.verifyAuthenticationResponse).not.toHaveBeenCalled();
});

test('POST returns 429 while the user is locked out', async () => {
  mocks.checkRateLimit.mockResolvedValue({
    allowed: false,
    lockedUntil: '2026-10-30T12:00:00.000Z',
  });

  const response = await postRequest();

  expect(response.status).toBe(429);
  expect(mocks.consumeChallenge).not.toHaveBeenCalled();
});
