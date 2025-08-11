import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page with key elements', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('/');

    // Check for the entity search input
    await expect(page.getByPlaceholder('Enter entity name or CUI...')).toBeVisible();

    // Check for the navigation page cards
    await expect(page.getByRole('link', { name: 'Charts Explore data through charts.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Map Explore data through a map.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Entities Explore entities by aggregated values.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'More More to come.' })).toBeVisible();
  });
});
