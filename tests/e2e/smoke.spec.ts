import { test, expect } from '@playwright/test';

test.describe('Smoke', () => {
  test('home page loads the votes explorer @smoke', async ({ page }) => {
    await page.goto('/');

    // Only elements present on both desktop and mobile layouts
    await expect(page).toHaveTitle('Voto Radar');
    await expect(page.getByText('Explorador de Votações')).toBeVisible();
    await expect(page.getByText('Ano da votação', { exact: false })).toBeVisible();
  });
});
