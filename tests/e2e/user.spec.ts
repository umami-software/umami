import { expect, test } from '@playwright/test';
import { loginPage, logout } from './helpers';

test.describe('User tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await loginPage(page, request);
    await page.goto('/settings/users');
  });

  test('adds a user', async ({ page }) => {
    await expect(page.getByText(/Create user/i)).toBeVisible();

    await page.getByTestId('button-create-user').click();
    await page.getByTestId('input-username').locator('input').fill('Test-user');
    await page.getByTestId('input-password').locator('input').fill('testPasswordPlaywright');
    await page.getByTestId('dropdown-role').click();
    await page.getByTestId('dropdown-item-user').click();
    await page.getByTestId('button-submit').click();

    await expect(page.locator('td[label="Username"]')).toContainText('Test-user');
    await expect(page.locator('td[label="Role"]')).toContainText('User');
  });

  test('edits a user role and password', async ({ page }) => {
    const userRow = page.locator('table tbody tr').filter({
      has: page.locator('td', { hasText: /Test-user/i }),
    });

    await userRow.getByTestId('link-button-edit').click();
    await page.getByTestId('input-password').locator('input').fill('newPassword');
    await page.getByTestId('dropdown-role').click();
    await page.getByTestId('dropdown-item-viewOnly').click();
    await page.getByTestId('button-submit').click();

    await page.goto('/settings/users');
    await expect(
      page.locator('table tbody tr').filter({ has: page.locator('td', { hasText: /Test-user/i }) }),
    ).toContainText('View only');

    await logout(page);
    await page.getByTestId('input-username').locator('input').fill('Test-user');
    await page.getByTestId('input-password').locator('input').fill('newPassword');
    await page.getByTestId('button-submit').click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('deletes a user', async ({ page }) => {
    const userRow = page.locator('table tbody tr').filter({
      has: page.locator('td', { hasText: /Test-user/i }),
    });

    await userRow.getByTestId('button-delete').click();
    await expect(page.getByText(/Are you sure you want to delete Test-user?/i)).toBeVisible();
    await page.getByTestId('button-confirm').click();
  });
});
