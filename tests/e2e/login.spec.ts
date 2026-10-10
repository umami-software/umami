import { expect, test } from '@playwright/test';
import { logout, umamiUser } from './helpers';

test.describe('Login tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('logs user in with correct credentials and logs user out', async ({ page }) => {
    await page.getByTestId('input-username').locator('input').fill(umamiUser.username);
    await page.getByTestId('input-password').locator('input').fill(umamiUser.password);
    await page.getByTestId('button-submit').click();

    await expect(page).toHaveURL(/\/dashboard$/);

    await logout(page);
  });

  test('shows validation for blank inputs or incorrect credentials', async ({ page }) => {
    await page.getByTestId('button-submit').click();
    await expect(page.getByText(/Required/i)).toBeVisible();

    await page.getByTestId('input-username').locator('input').fill(umamiUser.username);
    await page.getByTestId('input-password').locator('input').fill('wrongpassword');
    await page.getByTestId('button-submit').click();

    await expect(page.getByText(/Incorrect username and\/or password./i)).toBeVisible();
  });
});
