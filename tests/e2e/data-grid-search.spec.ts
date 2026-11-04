import { type APIRequestContext, expect, type Request, test } from '@playwright/test';
import { uuid } from '../../src/lib/crypto';
import { type Auth, authHeaders, deleteWebsite, loginPage, umamiUser } from './helpers';

// DataGrid pushes the search box into ?search= after a 600ms pause and copies ?search= back into
// the box whenever the URL changes. When the user keeps typing while that navigation is still
// loading, the box must keep the newer text once the navigation lands (regression test for the
// search box reverting to the value that was pushed).
const websites = [
  { id: uuid(), name: 'Search revert alpha', domain: 'search-revert-alpha.com' },
  { id: uuid(), name: 'Search revert beta', domain: 'search-revert-beta.com' },
];

async function createWebsite(
  request: APIRequestContext,
  auth: Auth,
  website: (typeof websites)[number],
) {
  const response = await request.post('/api/websites', {
    headers: authHeaders(auth),
    data: { ...website, createdBy: umamiUser.id },
  });
  expect(response.status()).toBe(200);
}

// The App Router navigation for a search (an RSC request), not a link prefetch.
function isSearchNavigation(request: Request, search: string) {
  const headers = request.headers();
  const url = new URL(request.url());

  return (
    headers.rsc === '1' &&
    !headers['next-router-prefetch'] &&
    url.pathname === '/websites' &&
    url.searchParams.get('search') === search
  );
}

test.describe('DataGrid search', () => {
  let auth: Auth;

  test.beforeEach(async ({ page, request }) => {
    auth = await loginPage(page, request);
    for (const website of websites) {
      await createWebsite(request, auth, website);
    }
    await page.goto('/websites');
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test.afterEach(async ({ request }) => {
    for (const website of websites) {
      await deleteWebsite(request, auth, website.id);
    }
  });

  test('keeps text typed while the search navigation is loading', async ({ page }) => {
    // Hold the response of the first search navigation until the user has typed more, as a slow
    // network would. A newer push would cancel that navigation and hide the bug, so stop the page
    // clock until it has landed: the next 600ms debounce cannot fire before it does.
    let release = () => {};
    const typed = new Promise<void>(resolve => {
      release = resolve;
    });
    await page.route(
      url => url.pathname === '/websites',
      async route => {
        if (!isSearchNavigation(route.request(), 'revert')) {
          return route.fallback();
        }
        const response = await route.fetch();
        await typed;
        await route.fulfill({ response });
      },
    );

    const search = page.getByRole('searchbox');
    const navigation = page.waitForRequest(request => isSearchNavigation(request, 'revert'));

    await page.clock.install();
    await search.pressSequentially('revert', { delay: 50 });
    await navigation;
    await page.clock.pauseAt(Date.now() + 1000); // Must be ahead of the page's clock.
    await search.pressSequentially(' beta', { delay: 50 });
    release();

    await expect(page).toHaveURL(/[?&]search=revert(&|$)/);
    await expect(search).toHaveValue('revert beta');

    await page.clock.resume();

    await expect(page).toHaveURL(/[?&]search=revert(\+|%20)beta(&|$)/);
    await expect(search).toHaveValue('revert beta');
    await expect(page.getByRole('link', { name: 'Search revert beta' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Search revert alpha' })).toHaveCount(0);
  });

  test('control: going back restores the previous search', async ({ page }) => {
    const search = page.getByRole('searchbox');

    await search.pressSequentially('revert', { delay: 50 });
    await expect(page).toHaveURL(/[?&]search=revert(&|$)/);
    await search.pressSequentially(' beta', { delay: 50 });
    await expect(page).toHaveURL(/[?&]search=revert(\+|%20)beta(&|$)/);

    await page.goBack();

    await expect(page).toHaveURL(/[?&]search=revert(&|$)/);
    await expect(search).toHaveValue('revert');
    await expect(page.getByRole('link', { name: 'Search revert alpha' })).toBeVisible();
  });
});
