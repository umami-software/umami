import { expect, test } from './fixtures';
import { login } from './helpers/auth';
import { UNKNOWN_UUID } from './helpers/constants';
import { createTeam, createUser, deleteTeam, deleteUser } from './helpers/entities';

test.describe('Admin', () => {
  test.describe('Listings', () => {
    test('GET /api/admin/users lists every user', async ({ admin, seed }) => {
      const response = await admin.get('/api/admin/users');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: expect.any(Array),
        count: expect.any(Number),
        page: 1,
        pageSize: expect.any(Number),
      });

      const ids = response.body.data.map((u: any) => u.id);

      expect(ids).toContain(seed.admin.id);
      expect(ids).toContain(seed.user.id);
      expect(ids).toContain(seed.viewer.id);

      const adminUser = response.body.data.find((u: any) => u.id === seed.admin.id);

      expect(adminUser).toMatchObject({
        username: seed.admin.username,
        role: 'admin',
        twoFactorRequired: expect.any(Boolean),
        _count: { websites: expect.any(Number) },
      });
      expect(adminUser).not.toHaveProperty('password');
    });

    test('GET /api/admin/users supports search, sorting and paging', async ({ admin, seed }) => {
      const search = await admin.get('/api/admin/users', { params: { search: 'api-' } });
      const byUsername = await admin.get('/api/admin/users', {
        params: { orderBy: 'username', sortDescending: 'false' },
      });
      const byRole = await admin.get('/api/admin/users', {
        params: { orderBy: 'role', sortDescending: 'true' },
      });
      const byCreated = await admin.get('/api/admin/users', { params: { orderBy: 'createdAt' } });
      const paged = await admin.get('/api/admin/users', { params: { page: 1, pageSize: 2 } });
      const badSort = await admin.get('/api/admin/users', { params: { sortDescending: 'yes' } });
      const badPage = await admin.get('/api/admin/users', { params: { pageSize: 'ten' } });

      expect(search.status).toBe(200);
      expect(search.body.data.length).toBeGreaterThanOrEqual(2);
      expect(search.body.data.map((u: any) => u.id)).toContain(seed.user.id);
      expect(search.body.data.every((u: any) => u.username.includes('api-'))).toBe(true);
      expect(search.body.data.map((u: any) => u.id)).not.toContain(seed.admin.id);

      expect(byUsername.status).toBe(200);
      const usernames = byUsername.body.data.map((u: any) => u.username);
      expect(usernames).toEqual([...usernames].sort());

      expect(byRole.status).toBe(200);
      expect(byCreated.status).toBe(200);
      expect(paged.status).toBe(200);
      expect(paged.body.pageSize).toBe(2);
      expect(paged.body.data.length).toBeLessThanOrEqual(2);
      expect(badSort.status).toBe(400);
      expect(badPage.status).toBe(400);
    });

    test('GET /api/admin/users requires an admin session', async ({
      api,
      user,
      viewer,
      apiKey,
    }) => {
      expect((await api.get('/api/admin/users')).status).toBe(401);
      expect((await user.get('/api/admin/users')).status).toBe(401);
      expect((await viewer.get('/api/admin/users')).status).toBe(401);
      // API keys are blocked on /api/admin/* even for admins.
      expect((await apiKey.get('/api/admin/users')).status).toBe(401);
    });

    test('GET /api/admin/websites lists every website with its owner', async ({ admin, seed }) => {
      const response = await admin.get('/api/admin/websites');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ data: expect.any(Array), count: expect.any(Number) });

      const ids = response.body.data.map((w: any) => w.id);

      expect(ids).toContain(seed.website.id);
      expect(ids).toContain(seed.website2.id);

      const website2 = response.body.data.find((w: any) => w.id === seed.website2.id);

      expect(website2).toMatchObject({
        name: seed.website2.name,
        domain: seed.website2.domain,
        user: { id: seed.user.id, username: seed.user.username },
      });
      expect(website2).toHaveProperty('shareId');
    });

    test('GET /api/admin/websites supports search, sorting and paging', async ({ admin, seed }) => {
      const byDomain = await admin.get('/api/admin/websites', {
        params: { search: seed.website2.domain },
      });
      const byName = await admin.get('/api/admin/websites', {
        params: { search: seed.website.name },
      });
      const sortedName = await admin.get('/api/admin/websites', {
        params: { orderBy: 'name', sortDescending: 'false', pageSize: 5 },
      });
      const sortedDomain = await admin.get('/api/admin/websites', {
        params: { orderBy: 'domain', sortDescending: 'true' },
      });
      const sortedCreated = await admin.get('/api/admin/websites', {
        params: { orderBy: 'createdAt' },
      });
      const badSort = await admin.get('/api/admin/websites', { params: { sortDescending: 'x' } });

      expect(byDomain.status).toBe(200);
      expect(byDomain.body.data.map((w: any) => w.id)).toContain(seed.website2.id);
      expect(byDomain.body.data.map((w: any) => w.id)).not.toContain(seed.website.id);
      expect(byName.status).toBe(200);
      expect(byName.body.data.map((w: any) => w.id)).toContain(seed.website.id);

      expect(sortedName.status).toBe(200);
      expect(sortedName.body.pageSize).toBe(5);
      expect(sortedName.body.data.length).toBeLessThanOrEqual(5);
      expect(sortedDomain.status).toBe(200);
      expect(sortedCreated.status).toBe(200);
      expect(badSort.status).toBe(400);
    });

    test('GET /api/admin/websites requires an admin session', async ({ api, user, apiKey }) => {
      expect((await api.get('/api/admin/websites')).status).toBe(401);
      expect((await user.get('/api/admin/websites')).status).toBe(401);
      expect((await apiKey.get('/api/admin/websites')).status).toBe(401);
    });

    test('GET /api/admin/teams lists every team with members', async ({ admin, seed }) => {
      const response = await admin.get('/api/admin/teams');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ data: expect.any(Array), count: expect.any(Number) });

      const team = response.body.data.find((t: any) => t.id === seed.team.id);

      expect(team).toMatchObject({
        name: seed.team.name,
        members: expect.any(Array),
        _count: { websites: expect.any(Number), members: expect.any(Number) },
      });
      expect(team.members.map((m: any) => m.userId)).toContain(seed.user.id);
      expect(team.members[0]).toMatchObject({
        role: expect.any(String),
        user: { id: expect.any(String), username: expect.any(String) },
      });
    });

    test('GET /api/admin/teams supports search, sorting and paging', async ({ admin, seed }) => {
      const search = await admin.get('/api/admin/teams', { params: { search: seed.team.name } });
      const none = await admin.get('/api/admin/teams', {
        params: { search: 'no-such-team-name-xyz' },
      });
      const sorted = await admin.get('/api/admin/teams', {
        params: { orderBy: 'name', sortDescending: 'true', page: 1, pageSize: 1 },
      });
      const badSort = await admin.get('/api/admin/teams', { params: { sortDescending: 'nope' } });

      expect(search.status).toBe(200);
      expect(search.body.data.map((t: any) => t.id)).toContain(seed.team.id);
      expect(none.status).toBe(200);
      expect(none.body.data).toEqual([]);
      expect(none.body.count).toBe(0);
      expect(sorted.status).toBe(200);
      expect(sorted.body.pageSize).toBe(1);
      expect(sorted.body.data.length).toBe(1);
      expect(badSort.status).toBe(400);
    });

    test('GET /api/admin/teams requires an admin session', async ({ api, user, apiKey }) => {
      expect((await api.get('/api/admin/teams')).status).toBe(401);
      expect((await user.get('/api/admin/teams')).status).toBe(401);
      expect((await apiKey.get('/api/admin/teams')).status).toBe(401);
    });
  });

  test.describe('Global 2FA enforcement', () => {
    test.describe.configure({ mode: 'serial' });

    test.afterAll(async ({ admin }) => {
      // Never leave the global requirement enabled for other specs.
      await admin.post('/api/admin/2fa/global', { required: false });
    });

    test('POST /api/admin/2fa/global validates the body', async ({ admin }) => {
      const stringValue = await admin.post('/api/admin/2fa/global', { required: 'true' });
      const missing = await admin.post('/api/admin/2fa/global', {});

      expect(stringValue.status).toBe(400);
      expect(missing.status).toBe(400);
    });

    test('POST /api/admin/2fa/global requires an admin session', async ({ api, user, apiKey }) => {
      expect((await api.post('/api/admin/2fa/global', { required: false })).status).toBe(401);
      expect((await user.post('/api/admin/2fa/global', { required: false })).status).toBe(401);
      expect((await apiKey.post('/api/admin/2fa/global', { required: false })).status).toBe(401);
    });

    test('POST /api/admin/2fa/global toggles the global requirement', async ({ admin, user }) => {
      const before = await user.get('/api/2fa/status');

      expect(before.status).toBe(200);
      expect(before.body.globalRequired).toBe(false);

      const enabled = await admin.post('/api/admin/2fa/global', { required: true });

      try {
        expect(enabled.status).toBe(200);
        expect(enabled.body).toEqual({ ok: true, required: true });

        const status = await user.get('/api/2fa/status');

        expect(status.status).toBe(200);
        expect(status.body).toMatchObject({
          isRequired: true,
          requiredReason: 'global',
          isConfigured: true,
          globalRequired: true,
        });
      } finally {
        const disabled = await admin.post('/api/admin/2fa/global', { required: false });

        expect(disabled.status).toBe(200);
        expect(disabled.body).toEqual({ ok: true, required: false });
      }

      const after = await user.get('/api/2fa/status');

      expect(after.body).toMatchObject({ globalRequired: false });
      expect(after.body.requiredReason).not.toBe('global');
    });
  });

  test.describe('Team 2FA enforcement', () => {
    test.describe.configure({ mode: 'serial' });

    let teamId = '';

    test.beforeAll(async ({ admin }) => {
      teamId = (await createTeam(admin)).id;
    });

    test.afterAll(async ({ admin }) => {
      if (teamId) {
        await admin.post(`/api/admin/teams/${teamId}/2fa`, { required: false });
        await deleteTeam(admin, teamId);
      }
    });

    test('POST /api/admin/teams/{teamId}/2fa validates the body', async ({ admin }) => {
      const stringValue = await admin.post(`/api/admin/teams/${teamId}/2fa`, { required: 'true' });
      const missing = await admin.post(`/api/admin/teams/${teamId}/2fa`, {});

      expect(stringValue.status).toBe(400);
      expect(missing.status).toBe(400);
    });

    test('POST /api/admin/teams/{teamId}/2fa requires an admin session', async ({
      api,
      user,
      apiKey,
    }) => {
      const body = { required: false };

      expect((await api.post(`/api/admin/teams/${teamId}/2fa`, body)).status).toBe(401);
      expect((await user.post(`/api/admin/teams/${teamId}/2fa`, body)).status).toBe(401);
      expect((await apiKey.post(`/api/admin/teams/${teamId}/2fa`, body)).status).toBe(401);
    });

    test('POST /api/admin/teams/{teamId}/2fa toggles the team requirement', async ({ admin }) => {
      const enabled = await admin.post(`/api/admin/teams/${teamId}/2fa`, { required: true });

      try {
        expect(enabled.status).toBe(200);
        expect(enabled.body).toEqual({ ok: true, teamId, twoFactorRequired: true });

        // The admin owns the throwaway team, so their status now reports the team reason.
        const status = await admin.get('/api/2fa/status');

        expect(status.status).toBe(200);
        expect(status.body).toMatchObject({ isRequired: true, requiredReason: 'team' });
      } finally {
        const disabled = await admin.post(`/api/admin/teams/${teamId}/2fa`, { required: false });

        expect(disabled.status).toBe(200);
        expect(disabled.body).toEqual({ ok: true, teamId, twoFactorRequired: false });
      }

      const after = await admin.get('/api/2fa/status');

      expect(after.body.requiredReason).not.toBe('team');
    });
  });

  test.describe('User 2FA enforcement', () => {
    test.describe.configure({ mode: 'serial' });

    let userId = '';
    let userToken = '';

    test.beforeAll(async ({ admin, api }) => {
      const created = await createUser(admin);

      userId = created.id;
      userToken = await login(api, { username: created.username, password: created.password });
    });

    test.afterAll(async ({ admin }) => {
      if (userId) {
        await deleteUser(admin, userId);
      }
    });

    test('GET /api/admin/users/{userId}/2fa reports whether 2FA is enabled', async ({ admin }) => {
      const response = await admin.get(`/api/admin/users/${userId}/2fa`);
      const unknown = await admin.get(`/api/admin/users/${UNKNOWN_UUID}/2fa`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isEnabled: false });
      // Unknown users simply have no 2FA record.
      expect(unknown.status).toBe(200);
      expect(unknown.body).toEqual({ isEnabled: false });
    });

    test('GET /api/admin/users/{userId}/2fa requires an admin session', async ({
      api,
      user,
      apiKey,
    }) => {
      expect((await api.get(`/api/admin/users/${userId}/2fa`)).status).toBe(401);
      expect((await user.get(`/api/admin/users/${userId}/2fa`)).status).toBe(401);
      expect((await apiKey.get(`/api/admin/users/${userId}/2fa`)).status).toBe(401);
    });

    test('POST /api/admin/users/{userId}/2fa validates the body', async ({ admin }) => {
      const stringValue = await admin.post(`/api/admin/users/${userId}/2fa`, { required: 'true' });
      const missing = await admin.post(`/api/admin/users/${userId}/2fa`, {});

      expect(stringValue.status).toBe(400);
      expect(missing.status).toBe(400);
    });

    test('POST /api/admin/users/{userId}/2fa requires an admin session', async ({
      api,
      user,
      apiKey,
    }) => {
      const body = { required: false };

      expect((await api.post(`/api/admin/users/${userId}/2fa`, body)).status).toBe(401);
      expect((await user.post(`/api/admin/users/${userId}/2fa`, body)).status).toBe(401);
      expect((await apiKey.post(`/api/admin/users/${userId}/2fa`, body)).status).toBe(401);
    });

    test('POST /api/admin/users/{userId}/2fa toggles the user requirement', async ({
      admin,
      api,
    }) => {
      const throwaway = api.bearer(userToken);
      const enabled = await admin.post(`/api/admin/users/${userId}/2fa`, { required: true });

      expect(enabled.status).toBe(200);
      expect(enabled.body).toEqual({ ok: true, userId, twoFactorRequired: true });

      const status = await throwaway.get('/api/2fa/status');
      const me = await throwaway.get('/api/me');
      const listed = await admin.get('/api/admin/users', { params: { search: userId } });

      expect(status.body).toMatchObject({
        isEnabled: false,
        isRequired: true,
        requiredReason: 'user',
        globalRequired: false,
      });
      expect(me.body.user.twoFactorRequired).toBe(true);
      expect(listed.status).toBe(200);

      const disabled = await admin.post(`/api/admin/users/${userId}/2fa`, { required: false });

      expect(disabled.status).toBe(200);
      expect(disabled.body).toEqual({ ok: true, userId, twoFactorRequired: false });

      const after = await throwaway.get('/api/2fa/status');

      expect(after.body).toMatchObject({ isRequired: false, requiredReason: null });
    });

    test('DELETE /api/admin/users/{userId}/2fa resets the user 2FA state', async ({
      admin,
      api,
      user,
      apiKey,
    }) => {
      const throwaway = api.bearer(userToken);

      // Leave a pending setup behind so the reset has something to clear.
      const initiated = await throwaway.post('/api/2fa/setup/initiate');

      expect(initiated.status).toBe(200);

      const denied = await user.del(`/api/admin/users/${userId}/2fa`);
      const viaApiKey = await apiKey.del(`/api/admin/users/${userId}/2fa`);
      const response = await admin.del(`/api/admin/users/${userId}/2fa`);
      const again = await admin.del(`/api/admin/users/${userId}/2fa`);

      expect(denied.status).toBe(401);
      expect(viaApiKey.status).toBe(401);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ok: true,
        userId,
        reset: {
          twoFactorAuth: 1,
          backupCodes: expect.any(Number),
          otpUsed: expect.any(Number),
          rateLimit: expect.any(Number),
        },
      });
      expect(again.status).toBe(200);
      expect(again.body.reset).toEqual({
        twoFactorAuth: 0,
        backupCodes: 0,
        otpUsed: 0,
        rateLimit: 0,
      });

      // The pending setup is gone.
      const confirm = await throwaway.post('/api/2fa/setup/confirm', { token: '000000' });

      expect(confirm.status).toBe(400);
      expect(confirm.body.error.code).toBe('two-factor-error-no-pending-setup');
    });
  });
});
