import { expect, test } from '@playwright/test';
import { addWebsite, deleteWebsite, loginPage } from './helpers';

test.describe('Website tests', () => {
  test('adds a website', async ({ page, request }) => {
    const auth = await loginPage(page, request);

    await page.goto('/settings/websites');
    await page.getByTestId('button-website-add').click();
    await expect(page.getByText(/Add website/i)).toBeVisible();
    await page.getByTestId('input-name').locator('input').fill('Add test');
    await page.getByTestId('input-domain').locator('input').fill('addtest.com');
    await page.getByTestId('button-submit').click();

    await expect(page.locator('td[label="Name"]')).toContainText('Add test');
    await expect(page.locator('td[label="Domain"]')).toContainText('addtest.com');

    await page.getByTestId('link-button-edit').first().click();
    await expect(page.getByText(/Details/i)).toBeVisible();

    const websiteId = await page.getByTestId('text-field-websiteId').locator('input').inputValue();

    await deleteWebsite(request, auth, websiteId);
    await page.goto('/settings/websites');
    await expect(page.getByText(/Add test/i)).toHaveCount(0);
  });

  test('edits a website', async ({ page, request }) => {
    const auth = await loginPage(page, request);

    await addWebsite(request, auth, 'Update test', 'updatetest.com');
    await page.goto('/settings/websites');

    await page.getByTestId('link-button-edit').first().click();
    await expect(page.getByText(/Details/i)).toBeVisible();
    await page.getByTestId('input-name').locator('input').fill('Updated website');
    await page.getByTestId('input-domain').locator('input').fill('updatedwebsite.com');
    await page.getByTestId('button-submit').click();

    await expect(page.getByTestId('input-name').locator('input')).toHaveValue('Updated website');
    await expect(page.getByTestId('input-domain').locator('input')).toHaveValue(
      'updatedwebsite.com',
    );

    await page.getByText(/Tracking code/i).click();
    await expect(page.locator('textarea')).toContainText('/script.js');

    await page.getByText(/Details/i).click();
    const websiteId = await page.getByTestId('text-field-websiteId').locator('input').inputValue();

    await deleteWebsite(request, auth, websiteId);
    await page.goto('/settings/websites');
    await expect(page.getByText(/Update test/i)).toHaveCount(0);
  });

  test('deletes a website', async ({ page, request }) => {
    const auth = await loginPage(page, request);

    await addWebsite(request, auth, 'Delete test', 'deletetest.com');
    await page.goto('/settings/websites');

    await page.getByTestId('link-button-edit').first().click();
    await expect(page.getByText(/Data/i)).toBeVisible();
    await page.getByText(/Data/i).click();
    await expect(page.getByText(/All website data will be deleted./i)).toBeVisible();
    await page.getByTestId('button-delete').click();
    await expect(page.getByText(/Type DELETE in the box below to confirm./i)).toBeVisible();
    await page.locator('input[name="confirm"]').fill('DELETE');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText(/Delete test/i)).toHaveCount(0);
  });
});
