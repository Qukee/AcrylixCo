import { test, expect } from '@playwright/test';

test('home page loads with placeholder copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Site under construction');
});
