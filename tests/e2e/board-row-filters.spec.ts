import { expect, test } from '@playwright/test';
import { uuid } from '../../src/lib/crypto';
import { type Auth, authHeaders, loginPage, umamiUser } from './helpers';

const region = 'VastraGotaland';

const rowFilters = {
  sessionPropertyFilters: [
    { propertyName: 'user_region', dataType: 1, operator: 'eq', value: region },
  ],
};

async function addWebsiteWithId(request: any, auth: Auth, name: string, domain: string) {
  const websiteId = uuid();
  const response = await request.post('/api/websites', {
    headers: authHeaders(auth),
    data: { id: websiteId, createdBy: umamiUser.id, name, domain },
  });

  expect(response.status()).toBe(200);

  return websiteId;
}

async function addBoard(request: any, auth: Auth, websiteId: string, filters?: object) {
  const response = await request.post('/api/boards', {
    headers: authHeaders(auth),
    data: {
      name: 'Row filter test',
      // createBoard() requires description even though the API schema marks it
      // optional — omitting it 500s.
      description: '',
      type: 'mixed',
      slug: '',
      parameters: {
        rows: [
          {
            id: uuid(),
            ...(filters ? { filters } : {}),
            columns: [
              {
                id: uuid(),
                component: {
                  type: 'WebsiteMetricsBar',
                  entityType: 'website',
                  entityId: websiteId,
                },
              },
            ],
          },
        ],
      },
    },
  });

  expect(response.status()).toBe(200);

  return (await response.json()).id;
}

test.describe('Board row filters', () => {
  test('saves a row filter with the board and returns it unchanged', async ({ page, request }) => {
    const auth = await loginPage(page, request);
    const websiteId = await addWebsiteWithId(request, auth, 'Row filter site', 'rowfilter.com');
    const boardId = await addBoard(request, auth, websiteId, rowFilters);

    const response = await request.get(`/api/boards/${boardId}`, { headers: authHeaders(auth) });
    expect(response.status()).toBe(200);

    const board = await response.json();

    expect(board.parameters.rows[0].filters).toEqual(rowFilters);

    await request.delete(`/api/boards/${boardId}`, { headers: authHeaders(auth) });
    await request.delete(`/api/websites/${websiteId}`, { headers: authHeaders(auth) });
  });

  test('scopes a filtered row and leaves an unfiltered one alone', async ({ page, request }) => {
    const auth = await loginPage(page, request);
    const websiteId = await addWebsiteWithId(request, auth, 'Row filter site', 'rowfilter2.com');
    const filteredBoard = await addBoard(request, auth, websiteId, rowFilters);
    const plainBoard = await addBoard(request, auth, websiteId);

    // The filtered row shows its filter and sends it with the row's queries.
    const scopedRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/websites/')) {
        scopedRequests.push(req.url());
      }
    });

    await page.goto(`/boards/${filteredBoard}`);
    await expect(page.getByTestId('board-row-filter-tags')).toContainText('user_region');
    await expect(page.getByTestId('board-row-filter-tags')).toContainText(region);
    await expect
      .poll(() => scopedRequests.some(url => url.includes(`spf0=1.eq.user_region.${region}`)))
      .toBe(true);

    // An unfiltered board renders no chips and sends no scoped params.
    scopedRequests.length = 0;
    await page.goto(`/boards/${plainBoard}`);
    await expect(page.getByTestId('board-row-filter-tags')).toHaveCount(0);
    await expect.poll(() => scopedRequests.length).toBeGreaterThan(0);
    expect(scopedRequests.some(url => url.includes('spf0='))).toBe(false);

    await request.delete(`/api/boards/${filteredBoard}`, { headers: authHeaders(auth) });
    await request.delete(`/api/boards/${plainBoard}`, { headers: authHeaders(auth) });
    await request.delete(`/api/websites/${websiteId}`, { headers: authHeaders(auth) });
  });
});
