import { expect, test } from '@playwright/test';
import { type Auth, authHeaders, loginViaApi } from './helpers';

test.describe('Board API tests', () => {
  test.describe.configure({ mode: 'serial' });

  let auth: Auth;
  let boardId = '';

  test.beforeAll(async ({ request }) => {
    auth = await loginViaApi(request);
  });

  test.afterAll(async ({ request }) => {
    if (boardId) {
      await request.delete(`/api/boards/${boardId}`, { headers: authHeaders(auth) });
    }
  });

  test('creates a board without a description', async ({ request }) => {
    const response = await request.post('/api/boards', {
      headers: authHeaders(auth),
      data: { name: 'Playwright board', type: 'mixed' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    boardId = body.id;

    expect(body).toHaveProperty('name', 'Playwright board');
    expect(body).toHaveProperty('description', '');
  });
});
