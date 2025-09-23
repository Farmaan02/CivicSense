import { test, expect } from '@playwright/test';

test('should navigate to login page and display login form', async ({ page }) => {
  await page.goto('/login');

  // Check that the login form is visible
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('should display error for invalid login credentials', async ({ page }) => {
  await page.goto('/login');

  // Fill in invalid credentials
  await page.getByLabel('Email').fill('invalid@example.com');
  await page.getByLabel('Password').fill('wrongpassword');
  
  // Submit the form
  await page.getByRole('button', { name: 'Login' }).click();

  // Check for error message
  await expect(page.getByText('Invalid email or password')).toBeVisible();
});