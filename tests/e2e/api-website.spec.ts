import { expect, test } from '@playwright/test';
import { uuid } from '../../src/lib/crypto';
import { teams, websites } from './fixtures';
import { type Auth, authHeaders, deleteTeam, loginViaApi } from './helpers';

test.describe('Website API tests', () => {
  test.describe.configure({ mode: 'serial' });

  let auth: Auth;
  let websiteId = '';
  let teamId = '';

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(request);

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

  test.afterAll(async ({ request }) => {
    if (teamId) {
      await deleteTeam(request, auth, teamId);
    }
  });

  test('creates a website for user', async ({ request }) => {
    const response = await request.post('/api/websites', {
      headers: authHeaders(auth),
      data: websites.websiteCreate,
    });
    const body = await response.json();

    websiteId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Playwright Website');
    expect(body).toHaveProperty('domain', 'playwright.com');
  });

  test('creates a website for team', async ({ request }) => {
    const response = await request.post('/api/websites', {
      headers: authHeaders(auth),
      data: {
        name: 'Team Website',
        domain: 'teamwebsite.com',
        teamId,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Team Website');
    expect(body).toHaveProperty('domain', 'teamwebsite.com');
  });

  test('creates a website with a fixed ID', async ({ request }) => {
    const fixedId = uuid();
    const response = await request.post('/api/websites', {
      headers: authHeaders(auth),
      data: { ...websites.websiteCreate, id: fixedId },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('id', fixedId);
    expect(body).toHaveProperty('name', 'Playwright Website');
    expect(body).toHaveProperty('domain', 'playwright.com');

    await request.delete(`/api/websites/${fixedId}`, {
      headers: authHeaders(auth),
    });
  });

  test('returns all tracked websites', async ({ request }) => {
    const response = await request.get('/api/websites', {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data[0]).toHaveProperty('id');
    expect(body.data[0]).toHaveProperty('name');
    expect(body.data[0]).toHaveProperty('domain');
  });

  test('gets a website by ID', async ({ request }) => {
    const response = await request.get(`/api/websites/${websiteId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Playwright Website');
    expect(body).toHaveProperty('domain', 'playwright.com');
  });

  test('updates a website', async ({ request }) => {
    const response = await request.post(`/api/websites/${websiteId}`, {
      headers: authHeaders(auth),
      data: websites.websiteUpdate,
    });
    const body = await response.json();

    websiteId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Playwright Website Updated');
    expect(body).toHaveProperty('domain', 'playwrightupdated.com');
  });

  test('updates a website with only shareId', async ({ request }) => {
    const response = await request.post(`/api/websites/${websiteId}`, {
      headers: authHeaders(auth),
      data: { shareId: 'ABCDEF' },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('shareId', 'ABCDEF');
  });

  test('resets a website by removing all data related to the website', async ({ request }) => {
    const response = await request.post(`/api/websites/${websiteId}/reset`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('ok', true);
  });

  test('deletes a website', async ({ request }) => {
    const response = await request.delete(`/api/websites/${websiteId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    websiteId = '';

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('ok', true);
  });
});
