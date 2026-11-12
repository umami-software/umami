import { expect, test } from './fixtures';
import { login } from './helpers/auth';
import { createUser, deleteUser } from './helpers/entities';
import { nextCode, wrongCode } from './helpers/totp';

/**
 * Full two-factor lifecycle on a throwaway user. TOTP codes are single-use and
 * bound to 30 s time steps, so several tests wait for the next step; the
 * describe timeout is raised accordingly.
 */
test.describe('Two-factor authentication', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  let userId = '';
  let username = '';
  let password = '';
  /** Regular session token for the throwaway user (issued before 2FA was enabled). */
  let sessionToken = '';
  let secret = '';
  let lastCode = '';
  let backupCodes: string[] = [];
  let partialToken = '';

  test.beforeAll(async ({ admin, api }) => {
    const created = await createUser(admin);

    userId = created.id;
    username = created.username;
    password = created.password;
    sessionToken = await login(api, { username, password });
  });

  test.afterAll(async ({ admin }) => {
    if (userId) {
      // Clear any 2FA state and lockouts before removing the user.
      await admin.post(`/api/admin/users/${userId}/2fa`, { required: false });
      await admin.del(`/api/admin/users/${userId}/2fa`);
      await deleteUser(admin, userId);
    }
  });

  test('GET /api/2fa/status reports the initial state', async ({ api, apiKey }) => {
    const session = api.bearer(sessionToken);
    const response = await session.get('/api/2fa/status');
    const anonymous = await api.get('/api/2fa/status');
    const viaApiKey = await apiKey.get('/api/2fa/status');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      isEnabled: false,
      isRequired: false,
      requiredReason: null,
      isConfigured: true,
      globalRequired: false,
    });
    expect(anonymous.status).toBe(401);
    // API keys are blocked on /api/2fa/*.
    expect(viaApiKey.status).toBe(401);
  });

  test('POST /api/2fa/setup/confirm rejects invalid bodies and missing setups', async ({
    api,
    apiKey,
  }) => {
    const session = api.bearer(sessionToken);
    const tooShort = await session.post('/api/2fa/setup/confirm', { token: '123' });
    const missing = await session.post('/api/2fa/setup/confirm', {});
    const noSetup = await session.post('/api/2fa/setup/confirm', { token: '000000' });
    const anonymous = await api.post('/api/2fa/setup/confirm', { token: '000000' });
    const viaApiKey = await apiKey.post('/api/2fa/setup/confirm', { token: '000000' });

    expect(tooShort.status).toBe(400);
    expect(missing.status).toBe(400);
    expect(noSetup.status).toBe(400);
    expect(noSetup.body.error.code).toBe('two-factor-error-no-pending-setup');
    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(401);
  });

  test('POST /api/2fa/setup/initiate returns a secret and QR code', async ({ api, apiKey }) => {
    const session = api.bearer(sessionToken);
    const response = await session.post('/api/2fa/setup/initiate');
    const anonymous = await api.post('/api/2fa/setup/initiate');
    const viaApiKey = await apiKey.post('/api/2fa/setup/initiate');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      qrCodeDataUrl: expect.stringMatching(/^data:image\/png;base64,/),
      manualKey: expect.stringMatching(/^[A-Z2-7]+=*$/),
    });
    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(401);

    // Status stays disabled until the setup is confirmed.
    const status = await session.get('/api/2fa/status');

    expect(status.body.isEnabled).toBe(false);
  });

  test('POST /api/2fa/setup/cancel discards the pending setup', async ({ api, apiKey }) => {
    const session = api.bearer(sessionToken);
    const response = await session.post('/api/2fa/setup/cancel');
    const again = await session.post('/api/2fa/setup/cancel');
    const confirm = await session.post('/api/2fa/setup/confirm', { token: '000000' });
    const anonymous = await api.post('/api/2fa/setup/cancel');
    const viaApiKey = await apiKey.post('/api/2fa/setup/cancel');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    // Cancelling is idempotent.
    expect(again.status).toBe(200);
    expect(again.body).toEqual({ ok: true });
    expect(confirm.status).toBe(400);
    expect(confirm.body.error.code).toBe('two-factor-error-no-pending-setup');
    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(401);
  });

  test('POST /api/2fa/setup/initiate can be repeated and rejects wrong codes', async ({ api }) => {
    const session = api.bearer(sessionToken);
    const response = await session.post('/api/2fa/setup/initiate');

    expect(response.status).toBe(200);

    secret = response.body.manualKey;

    // A single wrong attempt (the lockout threshold is five).
    const invalid = await session.post('/api/2fa/setup/confirm', { token: wrongCode(secret) });

    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toMatchObject({
      code: 'two-factor-error-invalid-code',
      message: 'Invalid verification code',
      status: 400,
    });
  });

  test('POST /api/2fa/setup/confirm enables 2FA and returns backup codes', async ({ api }) => {
    const session = api.bearer(sessionToken);
    lastCode = await nextCode(secret);

    const response = await session.post('/api/2fa/setup/confirm', { token: lastCode });

    expect(response.status).toBe(200);
    expect(response.body.backupCodes).toHaveLength(10);
    expect(new Set(response.body.backupCodes).size).toBe(10);

    for (const code of response.body.backupCodes) {
      expect(typeof code).toBe('string');
      expect(code.length).toBeGreaterThan(0);
    }

    backupCodes = response.body.backupCodes;

    const status = await session.get('/api/2fa/status');

    expect(status.body).toMatchObject({ isEnabled: true, isRequired: false });

    // Confirming again is rejected: there is no longer a pending setup.
    const again = await session.post('/api/2fa/setup/confirm', { token: lastCode });

    expect(again.status).toBe(400);
    expect(again.body.error.code).toBe('two-factor-error-no-pending-setup');
  });

  test('POST /api/2fa/setup/initiate rejects users with 2FA enabled', async ({ api }) => {
    const session = api.bearer(sessionToken);
    const response = await session.post('/api/2fa/setup/initiate');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('two-factor-error-already-enabled');
  });

  test('POST /api/auth/login returns a partial token when 2FA is enabled', async ({ api }) => {
    const response = await api.post('/api/auth/login', { username, password });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ requiresTwoFactor: true, partialToken: expect.any(String) });

    partialToken = response.body.partialToken;

    // NOTE: the partial token is currently accepted as a full session by
    // checkAuth (it only looks at payload.userId, not payload.type), which
    // bypasses the second factor. Not asserted here; reported as a bug.
  });

  test('POST /api/2fa/verify rejects missing, invalid and non-partial tokens', async ({
    api,
    apiKey,
  }) => {
    const session = api.bearer(sessionToken);
    const body = { token: '000000' };
    const missing = await api.post('/api/2fa/verify', body);
    const garbage = await api.bearer('not-a-token').post('/api/2fa/verify', body);
    const fullSession = await session.post('/api/2fa/verify', body);
    const viaApiKey = await apiKey.post('/api/2fa/verify', body);

    expect(missing.status).toBe(401);
    expect(missing.body.error.code).toBe('two-factor-error-missing-token');
    expect(garbage.status).toBe(401);
    expect(garbage.body.error.code).toBe('two-factor-error-invalid-partial-token');
    expect(fullSession.status).toBe(401);
    expect(fullSession.body.error.code).toBe('two-factor-error-invalid-partial-token');
    expect(viaApiKey.status).toBe(401);
  });

  test('POST /api/2fa/verify validates the body', async ({ api }) => {
    const partial = api.bearer(partialToken);
    const empty = await partial.post('/api/2fa/verify', {});
    const both = await partial.post('/api/2fa/verify', { token: '000000', backupCode: 'x' });
    const extra = await partial.post('/api/2fa/verify', { token: '000000', extra: true });
    const tooShort = await partial.post('/api/2fa/verify', { token: '12345' });
    const emptyBackup = await partial.post('/api/2fa/verify', { backupCode: '' });

    expect(empty.status).toBe(400);
    expect(both.status).toBe(400);
    expect(extra.status).toBe(400);
    expect(tooShort.status).toBe(400);
    expect(emptyBackup.status).toBe(400);
  });

  test('POST /api/2fa/verify rejects a code that was already used', async ({ api }) => {
    // The code accepted by setup/confirm stays blocked for 90 s.
    const response = await api.bearer(partialToken).post('/api/2fa/verify', { token: lastCode });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: 'two-factor-error-code-used',
      message: 'Code already used',
    });
  });

  test('POST /api/2fa/verify completes the login with a TOTP code', async ({ api }) => {
    const code = await nextCode(secret, lastCode);
    const response = await api.bearer(partialToken).post('/api/2fa/verify', { token: code });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: { id: userId, username, role: 'user', isAdmin: false, teams: expect.any(Array) },
    });
    expect(response.body).not.toHaveProperty('requiresTwoFactor');

    lastCode = code;

    // The issued token is a full session.
    const me = await api.bearer(response.body.token).get('/api/me');

    expect(me.status).toBe(200);
    expect(me.body.user.id).toBe(userId);
  });

  test('POST /api/2fa/verify accepts a backup code once', async ({ api }) => {
    const loginResponse = await api.post('/api/auth/login', { username, password });

    expect(loginResponse.body.requiresTwoFactor).toBe(true);

    const partial = api.bearer(loginResponse.body.partialToken);
    const response = await partial.post('/api/2fa/verify', { backupCode: backupCodes[0] });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ token: expect.any(String), user: { id: userId } });

    // Backup codes are single-use (this counts as one failed attempt).
    const reused = await api
      .bearer((await api.post('/api/auth/login', { username, password })).body.partialToken)
      .post('/api/2fa/verify', { backupCode: backupCodes[0] });

    expect(reused.status).toBe(400);
    expect(reused.body.error.code).toBe('two-factor-error-invalid-backup-code');
  });

  test('POST /api/2fa/disable validates the body and password', async ({ api, apiKey }) => {
    const session = api.bearer(sessionToken);
    const missingToken = await session.post('/api/2fa/disable', { password });
    const missingPassword = await session.post('/api/2fa/disable', { token: '000000' });
    const shortToken = await session.post('/api/2fa/disable', { password, token: '123' });
    const wrongPassword = await session.post('/api/2fa/disable', {
      password: 'wrong-password',
      token: '000000',
    });
    const anonymous = await api.post('/api/2fa/disable', { password, token: '000000' });
    const viaApiKey = await apiKey.post('/api/2fa/disable', { password, token: '000000' });

    expect(missingToken.status).toBe(400);
    expect(missingPassword.status).toBe(400);
    expect(shortToken.status).toBe(400);
    expect(wrongPassword.status).toBe(400);
    expect(wrongPassword.body.error).toMatchObject({
      code: 'two-factor-error-incorrect-password',
      message: 'Incorrect password',
    });
    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(401);
  });

  test('POST /api/2fa/disable is forbidden while 2FA is required', async ({ api, admin }) => {
    const session = api.bearer(sessionToken);
    const required = await admin.post(`/api/admin/users/${userId}/2fa`, { required: true });

    expect(required.status).toBe(200);

    try {
      const status = await session.get('/api/2fa/status');
      const response = await session.post('/api/2fa/disable', { password, token: '000000' });

      expect(status.body).toMatchObject({
        isEnabled: true,
        isRequired: true,
        requiredReason: 'user',
      });
      expect(response.status).toBe(403);
      expect(response.body.error).toMatchObject({
        code: 'two-factor-error-disable-not-allowed',
        message: '2FA is required and cannot be disabled',
      });
    } finally {
      const optional = await admin.post(`/api/admin/users/${userId}/2fa`, { required: false });

      expect(optional.status).toBe(200);
    }
  });

  test('POST /api/2fa/disable turns 2FA off', async ({ api, admin }) => {
    const session = api.bearer(sessionToken);
    const code = await nextCode(secret, lastCode);
    const response = await session.post('/api/2fa/disable', { password, token: code });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });

    lastCode = code;

    const status = await session.get('/api/2fa/status');
    const adminView = await admin.get(`/api/admin/users/${userId}/2fa`);
    const loginResponse = await api.post('/api/auth/login', { username, password });
    const again = await session.post('/api/2fa/disable', { password, token: code });

    expect(status.body).toMatchObject({ isEnabled: false, isRequired: false });
    expect(adminView.body).toEqual({ isEnabled: false });
    // Login is back to a single step.
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toEqual(expect.any(String));
    expect(loginResponse.body).not.toHaveProperty('requiresTwoFactor');
    expect(again.status).toBe(400);
    expect(again.body.error.code).toBe('two-factor-error-not-enabled');
  });
});
