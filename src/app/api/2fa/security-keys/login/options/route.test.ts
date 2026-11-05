import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  generateAuthenticationOptions: vi.fn(),
  getPartialAuthUserId: vi.fn(),
  saveChallenge: vi.fn(),
  getUserSecurityKeyCredentials: vi.fn(),
}));

vi.mock('@simplewebauthn/server', () => ({
  generateAuthenticationOptions: mocks.generateAuthenticationOptions,
}));

vi.mock('@/lib/two-factor/webauthn', () => ({
  WEBAUTHN_TIMEOUT: 60000,
  getPartialAuthUserId: mocks.getPartialAuthUserId,
  getRelyingParty: () => ({
    rpID: 'localhost',
    rpName: 'Umami',
    origin: ['http://localhost:3000'],
  }),
  saveChallenge: mocks.saveChallenge,
}));

vi.mock('@/queries/prisma/securityKey', () => ({
  getUserSecurityKeyCredentials: mocks.getUserSecurityKeyCredentials,
}));

import { POST } from './route';

function postRequest() {
  return POST(
    new Request('http://localhost/api/2fa/security-keys/login/options', { method: 'POST' }),
  );
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('CLOUD_MODE', '');
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }

  mocks.getPartialAuthUserId.mockReturnValue('user-1');
  mocks.getUserSecurityKeyCredentials.mockResolvedValue([
    { credentialId: 'credential-1', transports: ['usb', 'nfc'] },
  ]);
  mocks.generateAuthenticationOptions.mockResolvedValue({
    challenge: 'challenge-1',
    rpId: 'localhost',
  });
});

test('POST returns authentication options for the user and stores the challenge', async () => {
  const response = await postRequest();

  expect(response.status).toBe(200);
  expect(mocks.generateAuthenticationOptions).toHaveBeenCalledWith({
    rpID: 'localhost',
    timeout: 60000,
    allowCredentials: [{ id: 'credential-1', transports: ['usb', 'nfc'] }],
    userVerification: 'discouraged',
  });
  expect(mocks.saveChallenge).toHaveBeenCalledWith('user-1', 'authentication', 'challenge-1');
  await expect(response.json()).resolves.toEqual({ challenge: 'challenge-1', rpId: 'localhost' });
});

test('POST rejects requests without a partial sign-in token', async () => {
  mocks.getPartialAuthUserId.mockReturnValue(null);

  const response = await postRequest();

  expect(response.status).toBe(401);
  expect(mocks.saveChallenge).not.toHaveBeenCalled();
});

test('POST rejects users without security keys', async () => {
  mocks.getUserSecurityKeyCredentials.mockResolvedValue([]);

  const response = await postRequest();

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: 'security-key-error-not-registered' },
  });
  expect(mocks.saveChallenge).not.toHaveBeenCalled();
});
