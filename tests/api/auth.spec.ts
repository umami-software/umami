import { expect, test } from './fixtures';
import { login } from './helpers/auth';

test.describe('Auth', () => {
  test('POST /api/auth/login returns a token and the user', async ({ api, seed }) => {
    const response = await api.post('/api/auth/login', {
      username: seed.admin.username,
      password: seed.admin.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: {
        id: seed.admin.id,
        username: seed.admin.username,
        role: 'admin',
        createdAt: expect.any(String),
        isAdmin: true,
        teams: expect.any(Array),
      },
    });
    expect(response.body).not.toHaveProperty('requiresTwoFactor');
    expect(response.body.user).not.toHaveProperty('password');
  });

  test('POST /api/auth/login matches usernames case-insensitively', async ({ api, seed }) => {
    const response = await api.post('/api/auth/login', {
      username: seed.user.username.toUpperCase(),
      password: seed.user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ id: seed.user.id, role: 'user', isAdmin: false });
    // The response echoes the submitted username verbatim; the lookup itself is case-insensitive.
    expect(response.body.user.username.toLowerCase()).toBe(seed.user.username);
    expect(response.body.user.teams.map((t: any) => t.id)).toContain(seed.team.id);

    // The session resolves to the stored (lowercase) username.
    const me = await api.bearer(response.body.token).get('/api/me');

    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({ id: seed.user.id, username: seed.user.username });
  });

  test('POST /api/auth/login rejects bad credentials', async ({ api, seed }) => {
    const wrongPassword = await api.post('/api/auth/login', {
      username: seed.admin.username,
      password: 'not-the-password',
    });
    const unknownUser = await api.post('/api/auth/login', {
      username: 'no-such-user',
      password: seed.admin.password,
    });

    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body.error).toMatchObject({
      code: 'incorrect-username-password',
      status: 401,
    });
    expect(unknownUser.status).toBe(401);
    expect(unknownUser.body.error.code).toBe('incorrect-username-password');
  });

  test('POST /api/auth/login validates the body', async ({ api, seed }) => {
    const missingPassword = await api.post('/api/auth/login', { username: seed.admin.username });
    const missingUsername = await api.post('/api/auth/login', { password: seed.admin.password });
    const empty = await api.post('/api/auth/login', {});

    expect(missingPassword.status).toBe(400);
    expect(missingUsername.status).toBe(400);
    expect(empty.status).toBe(400);
    expect(empty.body.error).toMatchObject({ status: 400 });
  });

  test('POST /api/auth/verify returns the current session', async ({ admin, user, seed }) => {
    const response = await admin.post('/api/auth/verify');
    const asUser = await user.post('/api/auth/verify');

    expect(response.status).toBe(200);
    // The body is the flat user record plus its teams.
    expect(response.body).toMatchObject({
      id: seed.admin.id,
      username: seed.admin.username,
      role: 'admin',
      createdAt: expect.any(String),
      isAdmin: true,
      twoFactorRequired: expect.any(Boolean),
      teams: expect.any(Array),
    });
    expect(response.body).not.toHaveProperty('password');
    expect(asUser.status).toBe(200);
    expect(asUser.body.id).toBe(seed.user.id);
    expect(asUser.body.teams.map((t: any) => t.id)).toContain(seed.team.id);
  });

  test('POST /api/auth/verify rejects anonymous, invalid and API key callers', async ({
    api,
    apiKey,
  }) => {
    const anonymous = await api.post('/api/auth/verify');
    const garbage = await api.bearer('not-a-token').post('/api/auth/verify');
    const viaApiKey = await apiKey.post('/api/auth/verify');

    expect(anonymous.status).toBe(401);
    expect(garbage.status).toBe(401);
    // API keys are blocked on /api/auth/*.
    expect(viaApiKey.status).toBe(401);
  });

  test('POST /api/auth/logout acknowledges the logout', async ({ api, seed }) => {
    // Use a dedicated session so the shared worker tokens are never touched.
    const token = await login(api, seed.viewer);
    const response = await api.bearer(token).post('/api/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    // Without Redis the stateless token remains valid, so no follow-up 401 is asserted.
  });

  test('POST /api/auth/logout requires a session', async ({ api, apiKey }) => {
    const anonymous = await api.post('/api/auth/logout');
    const viaApiKey = await apiKey.post('/api/auth/logout');

    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(401);
  });
});
