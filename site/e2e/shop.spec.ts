import { test, expect } from '@playwright/test';

test('shop page lists products', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'The full collection.' })).toBeVisible();
  // Sidebar shows category links.
  await expect(page.getByRole('link', { name: 'All pieces' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Personal milestones' })).toBeVisible();
  // At least one product card link.
  const productLinks = page.locator('a[href^="/shop/"]');
  await expect(productLinks.first()).toBeVisible();
});

test('product detail page renders price + customise CTA', async ({ page }) => {
  await page.goto('/shop/mia-heart-baby');
  await expect(page.getByRole('heading', { level: 1, name: /Mia/ })).toBeVisible();
  await expect(page.getByText('AUD')).toBeVisible();
  await expect(page.getByRole('link', { name: /Customize this design/ })).toBeVisible();
});

test('category page filters products', async ({ page }) => {
  await page.goto('/shop/personal-milestones');
  await expect(page.getByRole('heading', { name: 'Personal milestones' })).toBeVisible();
  const productLinks = page.locator('a[href^="/shop/"]');
  await expect(productLinks.first()).toBeVisible();
});
