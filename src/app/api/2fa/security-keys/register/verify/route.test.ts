import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  verifyRegistrationResponse: vi.fn(),
  consumeChallenge: vi.fn(),
  createSecurityKey: vi.fn(),
  getSecurityKeyByCredentialId: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@simplewebauthn/server', () => ({
  verifyRegistrationResponse: mocks.verifyRegistrationResponse,
}));

vi.mock('@/lib/two-factor/webauthn', () => ({
  consumeChallenge: mocks.consumeChallenge,
  getRelyingParty: () => ({
    rpID: 'localhost',
    rpName: 'Umami',
    origin: ['http://localhost:3000'],
  }),
}));

vi.mock('@/queries/prisma/securityKey', () => ({
  createSecurityKey: mocks.createSecurityKey,
  getSecurityKeyByCredentialId: mocks.getSecurityKeyByCredentialId,
}));

import { POST } from './route';

const registrationResponse = {
  id: 'credential-1',
  rawId: 'credential-1',
  type: 'public-key',
  response: { clientDataJSON: 'client-data', attestationObject: 'attestation' },
  clientExtensionResults: {},
};

function postRequest() {
  return POST(
    new Request('http://localhost/api/2fa/security-keys/register/verify', { method: 'POST' }),
  );
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }

  mocks.parseRequest.mockResolvedValue({
    auth: { user: { id: 'user-1', username: 'alice' } },
    body: { name: 'YubiKey', response: registrationResponse },
    error: undefined,
  });
  mocks.consumeChallenge.mockResolvedValue('challenge-1');
  mocks.getSecurityKeyByCredentialId.mockResolvedValue(null);
  mocks.verifyRegistrationResponse.mockResolvedValue({
    verified: true,
    registrationInfo: {
      credential: {
        id: 'credential-1',
        publicKey: new Uint8Array([1, 2, 3]),
        counter: 0,
        transports: ['usb'],
      },
    },
  });
  mocks.createSecurityKey.mockImplementation(async data => ({
    id: 'key-1',
    name: data.name,
    createdAt: new Date('2026-10-01T00:00:00.000Z'),
  }));
});

test('POST stores a verified security key', async () => {
  const response = await postRequest();

  expect(response.status).toBe(200);
  expect(mocks.consumeChallenge).toHaveBeenCalledWith('user-1', 'registration');
  expect(mocks.verifyRegistrationResponse).toHaveBeenCalledWith({
    response: registrationResponse,
    expectedChallenge: 'challenge-1',
    expectedOrigin: ['http://localhost:3000'],
    expectedRPID: 'localhost',
    requireUserVerification: false,
  });
  expect(mocks.createSecurityKey).toHaveBeenCalledWith({
    userId: 'user-1',
    name: 'YubiKey',
    credentialId: 'credential-1',
    publicKey: 'AQID',
    counter: 0,
    transports: ['usb'],
  });
  await expect(response.json()).resolves.toMatchObject({ id: 'key-1', name: 'YubiKey' });
});

test('POST rejects a response without a pending challenge', async () => {
  mocks.consumeChallenge.mockResolvedValue(null);

  const response = await postRequest();

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'security-key-error-challenge-expired' },
  });
  expect(mocks.verifyRegistrationResponse).not.toHaveBeenCalled();
});

test('POST rejects a response that fails verification', async () => {
  mocks.verifyRegistrationResponse.mockRejectedValue(new Error('Unexpected origin'));

  const response = await postRequest();

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'security-key-error-verification-failed' },
  });
  expect(mocks.createSecurityKey).not.toHaveBeenCalled();
});

test('POST rejects a key that is already registered', async () => {
  mocks.getSecurityKeyByCredentialId.mockResolvedValue({ id: 'key-0' });

  const response = await postRequest();

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'security-key-error-already-registered' },
  });
  expect(mocks.createSecurityKey).not.toHaveBeenCalled();
});

test('POST returns 404 in cloud mode', async () => {
  vi.stubEnv('CLOUD_MODE', '1');

  const response = await postRequest();

  expect(response.status).toBe(404);
  expect(mocks.parseRequest).not.toHaveBeenCalled();
});
