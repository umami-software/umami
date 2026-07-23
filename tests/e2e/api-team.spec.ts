import { expect, test } from '@playwright/test';
import { teams, users } from './fixtures';
import { type Auth, authHeaders, deleteUser, loginViaApi, umamiUser } from './helpers';

test.describe('Team API tests', () => {
  test.describe.configure({ mode: 'serial' });

  let auth: Auth;
  let teamId = '';
  let userId = '';

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(request);

    const response = await request.post('/api/users', {
      headers: authHeaders(auth),
      data: users.userCreate,
    });
    const body = await response.json();

    userId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('username', 'playwright1');
    expect(body).toHaveProperty('role', 'user');
  });

  test.afterAll(async ({ request }) => {
    if (userId) {
      await deleteUser(request, auth, userId);
    }
  });

  test('creates a team', async ({ request }) => {
    const response = await request.post('/api/teams', {
      headers: authHeaders(auth),
      data: teams.teamCreate,
    });
    const body = await response.json();

    teamId = body[0].id;

    expect(response.status()).toBe(200);
    expect(body[0]).toHaveProperty('name', 'playwright');
    expect(body[1]).toHaveProperty('role', 'team-owner');
  });

  test('gets a team by ID', async ({ request }) => {
    const response = await request.get(`/api/teams/${teamId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', teamId);
  });

  test('updates a team', async ({ request }) => {
    const response = await request.post(`/api/teams/${teamId}`, {
      headers: authHeaders(auth),
      data: teams.teamUpdate,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', teamId);
    expect(body).toHaveProperty('name', 'playwrightUpdate');
  });

  test('gets all users that belong to a team', async ({ request }) => {
    const response = await request.get(`/api/teams/${teamId}/users`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('teamId');
    expect(body.data[0]).toHaveProperty('userId');
    expect(body.data[0]).toHaveProperty('user');
  });

  test('gets a user belonging to a team', async ({ request }) => {
    const response = await request.get(`/api/teams/${teamId}/users/${umamiUser.id}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('teamId');
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('role');
  });

  test('gets all websites belonging to a team', async ({ request }) => {
    const response = await request.get(`/api/teams/${teamId}/websites`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('data');
  });

  test('adds a user to a team', async ({ request }) => {
    const response = await request.post(`/api/teams/${teamId}/users`, {
      headers: authHeaders(auth),
      data: {
        userId,
        role: 'team-member',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('userId', userId);
    expect(body).toHaveProperty('role', 'team-member');
  });

  test('updates a user role on a team', async ({ request }) => {
    const response = await request.post(`/api/teams/${teamId}/users/${userId}`, {
      headers: authHeaders(auth),
      data: {
        role: 'team-view-only',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('userId', userId);
    expect(body).toHaveProperty('role', 'team-view-only');
  });

  test('removes a user from a team', async ({ request }) => {
    const response = await request.delete(`/api/teams/${teamId}/users/${userId}`, {
      headers: authHeaders(auth),
    });

    expect(response.status()).toBe(200);
  });

  test('deletes a team', async ({ request }) => {
    const response = await request.delete(`/api/teams/${teamId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    teamId = '';

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('ok', true);
  });
});
