import { expect, test } from '@playwright/test';
import { users } from './fixtures';
import { type Auth, authHeaders, loginViaApi } from './helpers';

test.describe('User API tests', () => {
  test.describe.configure({ mode: 'serial' });

  let auth: Auth;
  let userId = '';

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(request);
  });

  test('creates a user', async ({ request }) => {
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

  test('returns all users when admin access is used', async ({ request }) => {
    const response = await request.get('/api/admin/users', {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('username');
    expect(body.data[0]).toHaveProperty('password');
    expect(body.data[0]).toHaveProperty('role');
  });

  test('updates a user', async ({ request }) => {
    const response = await request.post(`/api/users/${userId}`, {
      headers: authHeaders(auth),
      data: users.userUpdate,
    });
    const body = await response.json();

    userId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', userId);
    expect(body).toHaveProperty('username', 'playwright1');
    expect(body).toHaveProperty('role', 'view-only');
  });

  test('gets a user by ID', async ({ request }) => {
    const response = await request.get(`/api/users/${userId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', userId);
    expect(body).toHaveProperty('username', 'playwright1');
    expect(body).toHaveProperty('role', 'view-only');
  });

  test('deletes a user', async ({ request }) => {
    const response = await request.delete(`/api/users/${userId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('ok', true);
  });

  test('gets all websites that belong to a user', async ({ request }) => {
    const response = await request.get(`/api/users/${userId}/websites`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('data');
  });

  test('gets all teams that belong to a user', async ({ request }) => {
    const response = await request.get(`/api/users/${userId}/teams`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('data');
  });
});
