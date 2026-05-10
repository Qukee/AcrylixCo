import { test, expect } from '@playwright/test';

test('home page loads with hero, featured products, footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Your name|Cast in light/,
  );
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByText('AcrylixCo · Sydney, Australia')).toBeVisible();
  // Featured product links resolve into /shop/:slug.
  const productLinks = page.locator('a[href^="/shop/"]');
  await expect(productLinks.first()).toBeVisible();
});
