import { test, expect } from '@playwright/test';

test('should display the homepage with key elements', async ({ page }) => {
  await page.goto('/');

  // Check that the main heading is visible
  await expect(page.getByText('CivicSense')).toBeVisible();

  // Check that the report button is visible
  await expect(page.getByRole('button', { name: 'Report an Issue' })).toBeVisible();

  // Check that the navigation menu is visible
  await expect(page.getByRole('navigation')).toBeVisible();
});