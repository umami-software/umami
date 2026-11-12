import { expect, type Page, test } from '@playwright/test';
import { loginPage, logout } from './helpers';

function userRow(page: Page) {
  return page.getByRole('row').filter({ hasText: 'Test-user' });
}

async function selectRole(page: Page, role: 'user' | 'viewOnly') {
  await page.getByRole('button', { name: /Role/i }).click();
  await page.getByTestId(`dropdown-item-${role}`).click();
}

async function openRowAction(page: Page, action: 'edit' | 'delete') {
  // The row's actions live in a menu behind its only button.
  await userRow(page).getByRole('button').click();
  await page.getByTestId(`link-button-${action}`).click();
}

test.describe('User tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await loginPage(page, request);
    await page.goto('/admin/users');
  });

  test('adds a user', async ({ page }) => {
    await page.getByTestId('button-create-user').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/Create user/i)).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Username' }).fill('Test-user');
    await dialog.getByTestId('input-password').fill('testPasswordPlaywright');
    await selectRole(page, 'user');
    await dialog.getByTestId('button-submit').click();

    await expect(userRow(page)).toContainText('User');
  });

  test('edits a user role and password', async ({ page }) => {
    await openRowAction(page, 'edit');
    await expect(page).toHaveURL(/\/admin\/users\/[^/]+$/);

    await page.getByTestId('input-password').fill('newPassword');
    await selectRole(page, 'viewOnly');
    await page.getByTestId('button-submit').click();
    await expect(page.getByText(/Saved/i).first()).toBeVisible();

    await page.goto('/admin/users');
    await expect(userRow(page)).toContainText('View only');

    await logout(page);
    await page.getByTestId('input-username').locator('input').fill('Test-user');
    await page.getByTestId('input-password').locator('input').fill('newPassword');
    await page.getByTestId('button-submit').click();

    await expect(page).toHaveURL(/\/websites$/);
  });

  test('deletes a user', async ({ page }) => {
    await openRowAction(page, 'delete');
    await expect(page.getByText(/Are you sure you want to delete Test-user?/i)).toBeVisible();
    await page.getByRole('button', { name: /^Delete$/i }).click();

    await expect(userRow(page)).toHaveCount(0);
  });
});
