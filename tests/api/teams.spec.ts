import { expect, test } from './fixtures';
import { UNKNOWN_UUID } from './helpers/constants';
import { createWebsite, deleteWebsite, uniqueDomain, uniqueName } from './helpers/entities';

test.describe('Teams', () => {
  test.describe.configure({ mode: 'serial' });

  let teamId = '';
  let accessCode = '';

  test.afterAll(async ({ admin }) => {
    if (teamId) {
      await admin.del(`/api/teams/${teamId}`);
    }
  });

  test('POST /api/teams creates a team owned by the caller', async ({ admin, seed }) => {
    const name = uniqueName('team');
    const response = await admin.post('/api/teams', { name });

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({ name });
    expect(response.body[1]).toMatchObject({ userId: seed.admin.id, role: 'team-owner' });

    teamId = response.body[0].id;
  });

  test('POST /api/teams validates the body and requires authentication', async ({ admin, api }) => {
    const tooLong = await admin.post('/api/teams', { name: 'x'.repeat(51) });
    const anonymous = await api.post('/api/teams', { name: 'x' });

    expect(tooLong.status).toBe(400);
    expect(anonymous.status).toBe(401);
  });

  test('GET /api/teams lists the caller teams', async ({ admin, viewer }) => {
    const response = await admin.get('/api/teams');
    const none = await viewer.get('/api/teams');

    expect(response.status).toBe(200);
    expect(response.body.data.map((t: any) => t.id)).toContain(teamId);
    expect(none.status).toBe(200);
    expect(none.body.data.map((t: any) => t.id)).not.toContain(teamId);
  });

  test('GET /api/teams/{teamId} returns the team', async ({ admin, viewer }) => {
    const response = await admin.get(`/api/teams/${teamId}`);
    const denied = await viewer.get(`/api/teams/${teamId}`);
    const unknown = await admin.get(`/api/teams/${UNKNOWN_UUID}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: teamId, accessCode: expect.any(String) });
    expect(denied.status).toBe(401);
    expect(unknown.status).toBe(404);

    accessCode = response.body.accessCode;
  });

  test('POST /api/teams/{teamId} updates the team', async ({ admin, user }) => {
    const name = uniqueName('renamed');
    const newCode = `team_${uniqueName('code')}`;
    const response = await admin.post(`/api/teams/${teamId}`, { name, accessCode: newCode });
    const denied = await user.post(`/api/teams/${teamId}`, { name });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: teamId, name, accessCode: newCode });
    expect(denied.status).toBe(401);

    accessCode = newCode;
  });

  test('POST /api/teams/join adds the caller to a team', async ({ viewer, seed }) => {
    const response = await viewer.post('/api/teams/join', { accessCode });
    const again = await viewer.post('/api/teams/join', { accessCode });
    const unknown = await viewer.post('/api/teams/join', { accessCode: 'team_nope' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ teamId, userId: seed.viewer.id, role: 'team-member' });
    expect(again.status).toBe(400);
    expect(unknown.status).toBe(404);
    expect(unknown.body.error.code).toBe('team-not-found');
  });

  test('GET /api/teams/{teamId}/users lists the members', async ({ admin, viewer, user }) => {
    const response = await admin.get(`/api/teams/${teamId}/users`);
    const member = await viewer.get(`/api/teams/${teamId}/users`);
    const denied = await user.get(`/api/teams/${teamId}/users`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      teamId,
      user: { id: expect.any(String), username: expect.any(String) },
    });
    expect(member.status).toBe(200);
    expect(denied.status).toBe(401);
  });

  test('GET /api/teams/{teamId}/users/{userId} returns a member', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.get(`/api/teams/${teamId}/users/${seed.viewer.id}`);
    const denied = await viewer.get(`/api/teams/${teamId}/users/${seed.viewer.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ teamId, userId: seed.viewer.id, role: 'team-member' });
    // Members that are not owners/managers cannot inspect memberships.
    expect(denied.status).toBe(401);
  });

  test('POST /api/teams/{teamId}/users/{userId} updates a member role', async ({
    admin,
    viewer,
    seed,
  }) => {
    const response = await admin.post(`/api/teams/${teamId}/users/${seed.viewer.id}`, {
      role: 'team-view-only',
    });
    const notMember = await admin.post(`/api/teams/${teamId}/users/${seed.user.id}`, {
      role: 'team-member',
    });
    const denied = await viewer.post(`/api/teams/${teamId}/users/${seed.viewer.id}`, {
      role: 'team-manager',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ userId: seed.viewer.id, role: 'team-view-only' });
    expect(notMember.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('DELETE /api/teams/{teamId}/users/{userId} removes a member', async ({ admin, seed }) => {
    const response = await admin.del(`/api/teams/${teamId}/users/${seed.viewer.id}`);
    const again = await admin.del(`/api/teams/${teamId}/users/${seed.viewer.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(again.status).toBe(400);
  });

  test('POST /api/teams/{teamId}/users adds a member', async ({ admin, user, seed }) => {
    const response = await admin.post(`/api/teams/${teamId}/users`, {
      userId: seed.user.id,
      role: 'team-member',
    });
    const again = await admin.post(`/api/teams/${teamId}/users`, {
      userId: seed.user.id,
      role: 'team-member',
    });
    const badRole = await admin.post(`/api/teams/${teamId}/users`, {
      userId: seed.viewer.id,
      role: 'team-owner',
    });
    const denied = await user.post(`/api/teams/${teamId}/users`, {
      userId: seed.viewer.id,
      role: 'team-member',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ userId: seed.user.id, role: 'team-member' });
    expect(again.status).toBe(400);
    expect(badRole.status).toBe(400);
    expect(denied.status).toBe(401);
  });

  test('GET /api/teams/{teamId}/websites|boards|links|pixels list team resources', async ({
    admin,
    user,
    viewer,
  }) => {
    const website = await createWebsite(admin, { teamId, domain: uniqueDomain() });

    try {
      const websites = await user.get(`/api/teams/${teamId}/websites`);
      const boards = await admin.get(`/api/teams/${teamId}/boards`);
      const links = await admin.get(`/api/teams/${teamId}/links`);
      const pixels = await admin.get(`/api/teams/${teamId}/pixels`);
      const denied = await viewer.get(`/api/teams/${teamId}/websites`);

      expect(websites.status).toBe(200);
      expect(websites.body.data.map((w: any) => w.id)).toContain(website.id);

      for (const response of [boards, links, pixels]) {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
      }

      expect(denied.status).toBe(401);
    } finally {
      await deleteWebsite(admin, website.id);
    }
  });

  test('DELETE /api/teams/{teamId} deletes the team', async ({ admin, user }) => {
    const denied = await user.del(`/api/teams/${teamId}`);
    const response = await admin.del(`/api/teams/${teamId}`);

    expect(denied.status).toBe(401);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });

    teamId = '';
  });
});
