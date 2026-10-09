import { type APIRequestContext, expect, type Page, test } from '@playwright/test';
import { uuid } from '../../src/lib/crypto';
import { type Auth, authHeaders, deleteWebsite, loginPage, umamiUser } from './helpers';

// The session modal is a bottom sheet capped at 1320px and centered, so on a
// wide viewport there are dark side margins. Clicking those margins must
// dismiss the modal (regression test for the full-width click-catcher bug).
const VIEWPORT = { width: 1600, height: 900 };

test.use({ viewport: VIEWPORT });

async function createWebsite(request: APIRequestContext, auth: Auth, websiteId: string) {
  const response = await request.post('/api/websites', {
    headers: authHeaders(auth),
    data: {
      id: websiteId,
      createdBy: umamiUser.id,
      name: 'Modal dismiss test',
      domain: 'modal-dismiss-test.com',
    },
  });
  expect(response.status()).toBe(200);
}

async function getSheetBox(page: Page) {
  const box = await page.getByRole('dialog').boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('dialog has no bounding box');
  return box;
}

test.describe('SessionModal outside-click dismissal', () => {
  let auth: Auth;
  const websiteId = uuid();

  test.beforeEach(async ({ page, request }) => {
    auth = await loginPage(page, request);
    await createWebsite(request, auth, websiteId);
    // The modal opens purely from the `session` query param, so a random id is
    // enough to render it — no seeded session data required.
    await page.goto(`/websites/${websiteId}/sessions?session=${uuid()}`);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test.afterEach(async ({ request }) => {
    await deleteWebsite(request, auth, websiteId);
  });

  test('clicking in the left side margin dismisses the modal', async ({ page }) => {
    const box = await getSheetBox(page);
    const marginX = 20;
    const midY = box.y + box.height / 2;
    expect(marginX).toBeLessThan(box.x); // genuinely outside the sheet

    await page.mouse.click(marginX, midY);

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).not.toHaveURL(/session=/);
  });

  test('clicking in the right side margin dismisses the modal', async ({ page }) => {
    const box = await getSheetBox(page);
    const marginX = VIEWPORT.width - 20;
    const midY = box.y + box.height / 2;
    expect(marginX).toBeGreaterThan(box.x + box.width); // genuinely outside the sheet

    await page.mouse.click(marginX, midY);

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).not.toHaveURL(/session=/);
  });

  test('control: clicking inside the sheet keeps the modal open', async ({ page }) => {
    const box = await getSheetBox(page);

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveURL(/session=/);
  });
});
