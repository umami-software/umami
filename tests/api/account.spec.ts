import { expect, test } from './fixtures';
import { login } from './helpers/auth';
import { UNKNOWN_UUID } from './helpers/constants';
import { createUser, deleteUser, uniqueName } from './helpers/entities';

test.describe('Account', () => {
  test('GET /api/me returns the session user', async ({ admin, user, seed }) => {
    const response = await admin.get('/api/me');
    const asUser = await user.get('/api/me');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: {
        id: seed.admin.id,
        username: seed.admin.username,
        role: 'admin',
        createdAt: expect.any(String),
        isAdmin: true,
        twoFactorRequired: expect.any(Boolean),
      },
    });
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('apiKey');
    expect(asUser.status).toBe(200);
    expect(asUser.body.user).toMatchObject({ id: seed.user.id, role: 'user', isAdmin: false });
  });

  test('GET /api/me identifies API key callers', async ({ apiKey, tokens, seed }) => {
    const response = await apiKey.get('/api/me');

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(seed.admin.id);
    expect(response.body.apiKey).toMatchObject({ id: tokens.apiKey.id, name: expect.any(String) });
  });

  test('GET /api/me requires authentication', async ({ api }) => {
    const anonymous = await api.get('/api/me');
    const garbage = await api.bearer('umami_not_a_real_key').get('/api/me');

    expect(anonymous.status).toBe(401);
    expect(garbage.status).toBe(401);
  });

  test.describe('API keys', () => {
    test.describe.configure({ mode: 'serial' });

    const name = uniqueName('key');
    let keyId = '';
    let key = '';

    test.afterAll(async ({ user }) => {
      if (keyId) {
        await user.del(`/api/me/api-keys/${keyId}`);
      }
    });

    test('POST /api/me/api-keys creates a key', async ({ user }) => {
      const response = await user.post('/api/me/api-keys', { name: `  ${name}  ` });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        // Names are trimmed.
        name,
        keyPrefix: expect.any(String),
        createdAt: expect.any(String),
        key: expect.stringMatching(/^umami_/),
      });
      expect(response.body.key.startsWith(response.body.keyPrefix)).toBe(true);
      expect(response.body).not.toHaveProperty('keyHash');

      keyId = response.body.id;
      key = response.body.key;
    });

    test('POST /api/me/api-keys validates the body', async ({ user }) => {
      const empty = await user.post('/api/me/api-keys', { name: '   ' });
      const missing = await user.post('/api/me/api-keys', {});
      const tooLong = await user.post('/api/me/api-keys', { name: 'x'.repeat(256) });

      expect(empty.status).toBe(400);
      expect(missing.status).toBe(400);
      expect(tooLong.status).toBe(400);
    });

    test('POST /api/me/api-keys rejects anonymous and API key callers', async ({ api, apiKey }) => {
      const anonymous = await api.post('/api/me/api-keys', { name });
      const viaApiKey = await apiKey.post('/api/me/api-keys', { name });

      expect(anonymous.status).toBe(401);
      expect(viaApiKey.status).toBe(401);
    });

    test('GET /api/me authenticates with the new key', async ({ api, seed }) => {
      const response = await api.bearer(key).get('/api/me');

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(seed.user.id);
      expect(response.body.apiKey).toEqual({ id: keyId, name });
    });

    test('GET /api/me/api-keys lists the caller keys without secrets', async ({
      user,
      admin,
      tokens,
    }) => {
      const response = await user.get('/api/me/api-keys');
      const adminKeys = await admin.get('/api/me/api-keys');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const created = response.body.find((k: any) => k.id === keyId);

      expect(created).toMatchObject({
        id: keyId,
        name,
        keyPrefix: expect.any(String),
        createdAt: expect.any(String),
      });
      expect(created).toHaveProperty('lastUsedAt');
      expect(created).not.toHaveProperty('key');
      expect(created).not.toHaveProperty('keyHash');

      // Keys are scoped to the caller: the admin sees the worker key, not the user key.
      expect(adminKeys.status).toBe(200);
      expect(adminKeys.body.map((k: any) => k.id)).toContain(tokens.apiKey.id);
      expect(adminKeys.body.map((k: any) => k.id)).not.toContain(keyId);
    });

    test('GET /api/me/api-keys rejects anonymous and API key callers', async ({ api, apiKey }) => {
      expect((await api.get('/api/me/api-keys')).status).toBe(401);
      expect((await apiKey.get('/api/me/api-keys')).status).toBe(401);
    });

    test('DELETE /api/me/api-keys/{keyId} rejects unknown and foreign keys', async ({
      admin,
      user,
      api,
      apiKey,
    }) => {
      const foreign = await admin.del(`/api/me/api-keys/${keyId}`);
      const unknown = await user.del(`/api/me/api-keys/${UNKNOWN_UUID}`);
      const anonymous = await api.del(`/api/me/api-keys/${keyId}`);
      const viaApiKey = await apiKey.del(`/api/me/api-keys/${keyId}`);

      expect(foreign.status).toBe(404);
      expect(unknown.status).toBe(404);
      expect(anonymous.status).toBe(401);
      expect(viaApiKey.status).toBe(401);
    });

    test('DELETE /api/me/api-keys/{keyId} revokes the key', async ({ user, api }) => {
      const response = await user.del(`/api/me/api-keys/${keyId}`);
      const list = await user.get('/api/me/api-keys');
      const revoked = await api.bearer(key).get('/api/me');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
      expect(list.body.map((k: any) => k.id)).not.toContain(keyId);
      expect(revoked.status).toBe(401);

      keyId = '';
    });
  });

  test.describe('Password', () => {
    test.describe.configure({ mode: 'serial' });

    let userId = '';
    let username = '';
    let password = '';
    let token = '';
    const newPassword = 'changed-password-1';

    test.beforeAll(async ({ admin, api }) => {
      const created = await createUser(admin);

      userId = created.id;
      username = created.username;
      password = created.password;
      token = await login(api, { username, password });
    });

    test.afterAll(async ({ admin }) => {
      if (userId) {
        await deleteUser(admin, userId);
      }
    });

    test('POST /api/me/password validates the body', async ({ api }) => {
      const client = api.bearer(token);
      const short = await client.post('/api/me/password', {
        currentPassword: password,
        newPassword: 'short',
      });
      const missingCurrent = await client.post('/api/me/password', { newPassword });
      const missingNew = await client.post('/api/me/password', { currentPassword: password });

      expect(short.status).toBe(400);
      expect(missingCurrent.status).toBe(400);
      expect(missingNew.status).toBe(400);
    });

    test('POST /api/me/password rejects a wrong current password', async ({ api }) => {
      const response = await api
        .bearer(token)
        .post('/api/me/password', { currentPassword: 'wrong-password', newPassword });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Current password is incorrect');
    });

    test('POST /api/me/password rejects anonymous and API key callers', async ({ api, apiKey }) => {
      const body = { currentPassword: password, newPassword };

      expect((await api.post('/api/me/password', body)).status).toBe(401);
      expect((await apiKey.post('/api/me/password', body)).status).toBe(401);
    });

    test('POST /api/me/password changes the password and invalidates the session', async ({
      api,
    }) => {
      const response = await api
        .bearer(token)
        .post('/api/me/password', { currentPassword: password, newPassword });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: userId, username, role: 'user' });
      expect(response.body).not.toHaveProperty('password');

      // Tokens are bound to the password hash, so the old session is rejected.
      const stale = await api.bearer(token).get('/api/me');
      const oldLogin = await api.post('/api/auth/login', { username, password });
      const newToken = await login(api, { username, password: newPassword });
      const fresh = await api.bearer(newToken).get('/api/me');

      expect(stale.status).toBe(401);
      expect(oldLogin.status).toBe(401);
      expect(fresh.status).toBe(200);
      expect(fresh.body.user.id).toBe(userId);
    });
  });

  test('GET /api/me/teams lists the caller teams', async ({ user, viewer, seed }) => {
    const response = await user.get('/api/me/teams');
    const none = await viewer.get('/api/me/teams');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: expect.any(Number),
    });
    expect(response.body.count).toBeGreaterThanOrEqual(1);
    expect(response.body.data.map((t: any) => t.id)).toContain(seed.team.id);
    expect(none.status).toBe(200);
    expect(none.body.data.map((t: any) => t.id)).not.toContain(seed.team.id);
  });

  test('GET /api/me/teams supports paging and sorting', async ({ user }) => {
    const paged = await user.get('/api/me/teams', { params: { page: 1, pageSize: 1 } });
    const byName = await user.get('/api/me/teams', {
      params: { orderBy: 'name', sortDescending: 'true' },
    });
    const byCreated = await user.get('/api/me/teams', {
      params: { orderBy: 'createdAt', sortDescending: 'false' },
    });
    const badSort = await user.get('/api/me/teams', { params: { sortDescending: 'yes' } });
    const badPage = await user.get('/api/me/teams', { params: { page: 0 } });

    expect(paged.status).toBe(200);
    expect(paged.body.pageSize).toBe(1);
    expect(paged.body.data.length).toBeLessThanOrEqual(1);
    expect(byName.status).toBe(200);
    expect(byCreated.status).toBe(200);
    expect(badSort.status).toBe(400);
    expect(badPage.status).toBe(400);
  });

  test('GET /api/me/teams accepts session and API key callers only', async ({ api, apiKey }) => {
    const anonymous = await api.get('/api/me/teams');
    const viaApiKey = await apiKey.get('/api/me/teams');

    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(200);
    expect(viaApiKey.body).toHaveProperty('data');
  });

  test('GET /api/me/websites lists the caller websites', async ({ user, admin, seed }) => {
    const response = await user.get('/api/me/websites');
    const asAdmin = await admin.get('/api/me/websites');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      count: expect.any(Number),
      page: 1,
      pageSize: expect.any(Number),
    });

    const website2 = response.body.data.find((w: any) => w.id === seed.website2.id);

    expect(website2).toMatchObject({ name: seed.website2.name, domain: seed.website2.domain });
    expect(website2).toHaveProperty('shareId');
    // Only websites owned by the caller are listed by default.
    expect(response.body.data.map((w: any) => w.id)).not.toContain(seed.website.id);
    expect(asAdmin.body.data.map((w: any) => w.id)).toContain(seed.website.id);
  });

  test('GET /api/me/websites supports includeTeams, paging and sorting', async ({ user, seed }) => {
    const withTeams = await user.get('/api/me/websites', { params: { includeTeams: 'true' } });
    const paged = await user.get('/api/me/websites', {
      params: { page: 1, pageSize: 1, orderBy: 'name', sortDescending: 'false' },
    });
    const badSort = await user.get('/api/me/websites', { params: { sortDescending: '1' } });

    expect(withTeams.status).toBe(200);
    expect(withTeams.body.data.map((w: any) => w.id)).toContain(seed.website2.id);
    expect(paged.status).toBe(200);
    expect(paged.body.pageSize).toBe(1);
    expect(paged.body.data.length).toBeLessThanOrEqual(1);
    expect(badSort.status).toBe(400);
  });

  test('GET /api/me/websites accepts session and API key callers only', async ({
    api,
    apiKey,
    seed,
  }) => {
    const anonymous = await api.get('/api/me/websites');
    const viaApiKey = await apiKey.get('/api/me/websites');

    expect(anonymous.status).toBe(401);
    expect(viaApiKey.status).toBe(200);
    expect(viaApiKey.body.data.map((w: any) => w.id)).toContain(seed.website.id);
  });
});
