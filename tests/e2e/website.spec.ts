import { expect, type Page, test } from '@playwright/test';
import { addWebsite, deleteWebsite, loginPage } from './helpers';

function websiteRow(page: Page, name: string) {
  return page.getByRole('row').filter({ hasText: name });
}

// Opens the website's settings page from its row and returns the website ID from the URL.
async function openSettings(page: Page, name: string) {
  await websiteRow(page, name).getByTestId('link-button-edit').click();
  await expect(page).toHaveURL(/\/websites\/[^/]+\/settings$/);

  return new URL(page.url()).pathname.split('/')[2];
}

test.describe('Website tests', () => {
  test('adds a website', async ({ page, request }) => {
    const auth = await loginPage(page, request);

    await page.goto('/websites');
    await page.getByRole('button', { name: /Add website/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/Add website/i)).toBeVisible();
    await dialog.getByTestId('input-name').locator('input').fill('Add test');
    await dialog.getByTestId('input-domain').locator('input').fill('addtest.com');
    await dialog.getByTestId('button-submit').click();

    const row = websiteRow(page, 'Add test');
    await expect(row).toContainText('addtest.com');

    const websiteId = await openSettings(page, 'Add test');

    await deleteWebsite(request, auth, websiteId);
    await page.goto('/websites');
    await expect(page.getByText(/Add test/i)).toHaveCount(0);
  });

  test('edits a website', async ({ page, request }) => {
    const auth = await loginPage(page, request);

    await addWebsite(request, auth, 'Update test', 'updatetest.com');
    await page.goto('/websites');

    const websiteId = await openSettings(page, 'Update test');
    await page.getByTestId('input-name').locator('input').fill('Updated website');
    await page.getByTestId('input-domain').locator('input').fill('updatedwebsite.com');
    await page.getByTestId('button-submit').click();
    await expect(page.getByText(/Saved/i).first()).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('input-name').locator('input')).toHaveValue('Updated website');
    await expect(page.getByTestId('input-domain').locator('input')).toHaveValue(
      'updatedwebsite.com',
    );
    await expect(page.locator('textarea')).toContainText('/script.js');

    await deleteWebsite(request, auth, websiteId);
    await page.goto('/websites');
    await expect(page.getByText(/Updated website/i)).toHaveCount(0);
  });

  test('deletes a website', async ({ page, request }) => {
    const auth = await loginPage(page, request);

    await addWebsite(request, auth, 'Delete test', 'deletetest.com');
    await page.goto('/websites');

    await openSettings(page, 'Delete test');
    await expect(page.getByText(/All website data will be deleted./i)).toBeVisible();
    await page.getByTestId('button-delete').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/Type DELETE in the box below to confirm./i)).toBeVisible();
    await dialog.locator('input[name="confirm"]').fill('DELETE');
    await dialog.getByRole('button', { name: /Delete/i }).click();

    await expect(page).toHaveURL(/\/websites$/);
    await expect(page.getByText(/Delete test/i)).toHaveCount(0);
  });
});
