import { test, expect } from '@playwright/test';

test('should submit a report successfully', async ({ page }) => {
  await page.goto('/');

  // Click the report button
  await page.getByRole('button', { name: 'Report an Issue' }).click();

  // Fill out the report form
  await page.getByLabel('Issue Description *').fill('Test report from E2E test');
  await page.getByLabel('Your Email Address').fill('test@example.com');
  
  // Submit the report
  await page.getByRole('button', { name: 'Submit Report' }).click();

  // Check for success message
  await expect(page.getByText('Report submitted successfully')).toBeVisible();
  
  // Check that we have a tracking ID
  await expect(page.getByText('Tracking ID:')).toBeVisible();
});