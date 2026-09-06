import { expect, test } from './fixtures';
import { login } from './helpers/auth';
import { UNKNOWN_UUID } from './helpers/constants';
import { uniqueName } from './helpers/entities';

test.describe('Users', () => {
  test.describe.configure({ mode: 'serial' });

  const username = uniqueName('user');
  const password = 'spec-password-1';
  let userId = '';

  test.afterAll(async ({ admin }) => {
    if (userId) {
      await admin.del(`/api/users/${userId}`);
    }
  });

  test('POST /api/users creates a user', async ({ admin }) => {
    const response = await admin.post('/api/users', {
      username: username.toUpperCase(),
      password,
      role: 'user',
    });

    expect(response.status).toBe(200);
    // Usernames are stored lowercased.
    expect(response.body).toMatchObject({ username, role: 'user' });

    userId = response.body.id;
  });

  test('POST /api/users rejects duplicates and invalid bodies', async ({ admin }) => {
    const duplicate = await admin.post('/api/users', { username, password, role: 'user' });
    const shortPassword = await admin.post('/api/users', {
      username: uniqueName('user'),
      password: 'short',
      role: 'user',
    });
    const badRole = await admin.post('/api/users', {
      username: uniqueName('user'),
      password,
      role: 'superuser',
    });

    expect(duplicate.status).toBe(400);
    expect(duplicate.body.error.message).toBe('User already exists');
    expect(shortPassword.status).toBe(400);
    expect(badRole.status).toBe(400);
  });

  test('POST /api/users requires an admin session', async ({ api, user, apiKey }) => {
    const body = { username: uniqueName('user'), password, role: 'user' };

    expect((await api.post('/api/users', body)).status).toBe(401);
    expect((await user.post('/api/users', body)).status).toBe(401);
    // API keys are blocked on /api/users even for admins.
    expect((await apiKey.post('/api/users', body)).status).toBe(401);
  });

  test('GET /api/users/{userId} returns a user', async ({ admin, api, viewer }) => {
    const response = await admin.get(`/api/users/${userId}`);
    const self = await api
      .bearer(await login(api, { username, password }))
      .get(`/api/users/${userId}`);
    const denied = await viewer.get(`/api/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: userId, username, role: 'user' });
    expect(response.body).not.toHaveProperty('password');
    expect(self.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('POST /api/users/{userId} lets admins update role, username and password', async ({
    admin,
    api,
  }) => {
    const newPassword = 'spec-password-2';
    const response = await admin.post(`/api/users/${userId}`, {
      role: 'view-only',
      password: newPassword,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: userId, username, role: 'view-only' });

    // The new password works and the old one does not.
    expect(await login(api, { username, password: newPassword })).toEqual(expect.any(String));
    expect((await api.post('/api/auth/login', { username, password })).status).toBe(401);

    await admin.post(`/api/users/${userId}`, { password });
  });

  test('POST /api/users/{userId} ignores role changes from non-admins', async ({ user, seed }) => {
    const response = await user.post(`/api/users/${seed.user.id}`, { role: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body.role).toBe('user');
  });

  test('POST /api/users/{userId} rejects unknown users and other users', async ({
    admin,
    user,
  }) => {
    const unknown = await admin.post(`/api/users/${UNKNOWN_UUID}`, { role: 'user' });
    const denied = await user.post(`/api/users/${userId}`, { password: 'spec-password-3' });

    expect(unknown.status).toBe(404);
    expect(denied.status).toBe(401);
  });

  test('GET /api/users/{userId}/websites lists a user websites', async ({
    admin,
    user,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`/api/users/${seed.user.id}/websites`);
    const self = await user.get(`/api/users/${seed.user.id}/websites`, {
      params: { includeTeams: 'true' },
    });
    const denied = await viewer.get(`/api/users/${seed.user.id}/websites`);

    expect(response.status).toBe(200);
    expect(response.body.data.map((w: any) => w.id)).toContain(seed.website2.id);
    expect(self.status).toBe(200);
    expect(self.body.data.map((w: any) => w.id)).toContain(seed.website2.id);
    expect(denied.status).toBe(401);
  });

  test('GET /api/users/{userId}/teams lists a user teams', async ({
    admin,
    user,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`/api/users/${seed.user.id}/teams`);
    const self = await user.get(`/api/users/${seed.user.id}/teams`);
    const denied = await viewer.get(`/api/users/${seed.user.id}/teams`);

    expect(response.status).toBe(200);
    expect(response.body.data.map((t: any) => t.id)).toContain(seed.team.id);
    expect(self.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('DELETE /api/users/{userId} deletes a user', async ({ admin, user, seed }) => {
    const denied = await user.del(`/api/users/${userId}`);
    const self = await admin.del(`/api/users/${seed.admin.id}`);
    const response = await admin.del(`/api/users/${userId}`);

    expect(denied.status).toBe(401);
    expect(self.status).toBe(400);
    expect(self.body.error.message).toBe('You cannot delete yourself.');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });

    userId = '';
  });
});
