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

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function seedSessions(request: any, websiteId: string, value: string, count: number) {
  for (let i = 0; i < count; i++) {
    const payload = {
      website: websiteId,
      hostname: 'rowfilter.test',
      language: 'en-US',
      screen: '1512x982',
      url: `/seed-${value}-${i}`,
    };
    const headers = { 'Content-Type': 'application/json', 'User-Agent': `${UA} [${value}${i}]` };

    await request.post('/api/send', {
      headers,
      data: { type: 'identify', payload: { ...payload, data: { user_region: value } } },
    });
    await request.post('/api/send', { headers, data: { type: 'event', payload } });
  }
}

async function addBoard(
  request: any,
  auth: Auth,
  websiteId: string,
  filters?: object,
  extraWebsiteId?: string,
) {
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
            columns: extraWebsiteId
              ? [
                  {
                    id: uuid(),
                    component: {
                      type: 'WebsiteMetricsBar',
                      entityType: 'website',
                      entityId: websiteId,
                    },
                  },
                  {
                    id: uuid(),
                    component: {
                      type: 'WebsiteMetricsBar',
                      entityType: 'website',
                      entityId: extraWebsiteId,
                    },
                  },
                ]
              : [
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

  test('leaves columns for another website unscoped on a mixed row', async ({ page, request }) => {
    const auth = await loginPage(page, request);
    const filtered = await addWebsiteWithId(request, auth, 'Row filter A', 'rowfiltera.com');
    const other = await addWebsiteWithId(request, auth, 'Row filter B', 'rowfilterb.com');

    // Website A has 2 sessions in the region we filter on; website B has 3
    // sessions and no such property at all.
    await seedSessions(request, filtered, region, 2);
    await seedSessions(request, other, 'Elsewhere', 3);

    const boardId = await addBoard(
      request,
      auth,
      filtered,
      { ...rowFilters, websiteId: filtered },
      other,
    );

    const scopedRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/websites/')) {
        scopedRequests.push(req.url());
      }
    });

    await page.goto(`/boards/${boardId}`);
    await expect(page.getByTestId('board-row-filter-tags')).toContainText(region);
    await expect.poll(() => scopedRequests.some(url => url.includes(filtered))).toBe(true);
    await expect.poll(() => scopedRequests.some(url => url.includes(other))).toBe(true);

    // The filter must ride along only on the website it was defined for.
    const filteredWithParam = scopedRequests.filter(
      url => url.includes(filtered) && url.includes('spf0='),
    );
    const otherWithParam = scopedRequests.filter(
      url => url.includes(other) && url.includes('spf0='),
    );

    expect(filteredWithParam.length).toBeGreaterThan(0);
    expect(otherWithParam).toEqual([]);

    await request.delete(`/api/boards/${boardId}`, { headers: authHeaders(auth) });
    await request.delete(`/api/websites/${filtered}`, { headers: authHeaders(auth) });
    await request.delete(`/api/websites/${other}`, { headers: authHeaders(auth) });
  });
});
