import { expect, test } from '@playwright/test';
import { websites } from './fixtures';
import { type Auth, authHeaders, loginViaApi } from './helpers';

test.describe('Website Group API tests', () => {
  test.describe.configure({ mode: 'serial' });

  let auth: Auth;
  let rootGroupId = '';
  let childGroupId = '';
  let websiteId = '';

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(request);
  });

  test.afterAll(async ({ request }) => {
    if (websiteId) {
      await request.delete(`/api/websites/${websiteId}`, { headers: authHeaders(auth) });
    }
    if (childGroupId) {
      await request.delete(`/api/website-groups/${childGroupId}`, { headers: authHeaders(auth) });
    }
    if (rootGroupId) {
      await request.delete(`/api/website-groups/${rootGroupId}`, { headers: authHeaders(auth) });
    }
  });

  test('creates a root website group', async ({ request }) => {
    const response = await request.post('/api/website-groups', {
      headers: authHeaders(auth),
      data: { name: 'Playwright Group' },
    });
    const body = await response.json();

    rootGroupId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Playwright Group');
    expect(body.parentId).toBeNull();
  });

  test('creates a nested website group', async ({ request }) => {
    const response = await request.post('/api/website-groups', {
      headers: authHeaders(auth),
      data: { name: 'Playwright Child', parentId: rootGroupId },
    });
    const body = await response.json();

    childGroupId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Playwright Child');
    expect(body).toHaveProperty('parentId', rootGroupId);
  });

  test('lists website groups', async ({ request }) => {
    const response = await request.get('/api/website-groups', {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data.some((group: any) => group.id === rootGroupId)).toBe(true);
  });

  test('returns website tree', async ({ request }) => {
    const response = await request.get('/api/me/website-tree', {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((node: any) => node.type === 'group' && node.id === rootGroupId)).toBe(true);
  });

  test('creates a website in a group', async ({ request }) => {
    const response = await request.post('/api/websites', {
      headers: authHeaders(auth),
      data: {
        ...websites.websiteCreate,
        name: 'Grouped Website',
        domain: 'grouped.example.com',
        groupId: childGroupId,
      },
    });
    const body = await response.json();

    websiteId = body.id;

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('groupId', childGroupId);
  });

  test('returns groupPath on website list', async ({ request }) => {
    const response = await request.get('/api/me/websites', {
      headers: authHeaders(auth),
      params: { search: 'Grouped Website' },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.data[0]).toHaveProperty('groupPath', 'Playwright Group / Playwright Child');
  });

  test('updates a website group', async ({ request }) => {
    const response = await request.post(`/api/website-groups/${rootGroupId}`, {
      headers: authHeaders(auth),
      data: { name: 'Playwright Group Updated' },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('name', 'Playwright Group Updated');
  });

  test('rejects group cycle on update', async ({ request }) => {
    const response = await request.post(`/api/website-groups/${rootGroupId}`, {
      headers: authHeaders(auth),
      data: { parentId: childGroupId },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error.message).toBe('Group cannot be moved into its own descendant.');
  });

  test('deletes nested group and moves website to parent group', async ({ request }) => {
    const response = await request.delete(`/api/website-groups/${childGroupId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    childGroupId = '';

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('ok', true);

    const websiteResponse = await request.get(`/api/websites/${websiteId}`, {
      headers: authHeaders(auth),
    });
    const website = await websiteResponse.json();

    expect(website.groupId).toBe(rootGroupId);

    const listResponse = await request.get('/api/me/websites', {
      headers: authHeaders(auth),
      params: { search: 'Grouped Website' },
    });
    const list = await listResponse.json();

    expect(list.data[0]).toHaveProperty('groupPath', 'Playwright Group Updated');
  });

  test('deletes root group and moves website to root', async ({ request }) => {
    const response = await request.delete(`/api/website-groups/${rootGroupId}`, {
      headers: authHeaders(auth),
    });
    const body = await response.json();

    rootGroupId = '';

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('ok', true);

    const websiteResponse = await request.get(`/api/websites/${websiteId}`, {
      headers: authHeaders(auth),
    });
    const website = await websiteResponse.json();

    expect(website.groupId).toBeNull();

    const listResponse = await request.get('/api/me/websites', {
      headers: authHeaders(auth),
      params: { search: 'Grouped Website' },
    });
    const list = await listResponse.json();

    expect(list.data[0].groupPath).toBeNull();
  });
});
