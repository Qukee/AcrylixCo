import { test, expect } from '@playwright/test';

const PAGES: { path: string; expectedHeading: RegExp }[] = [
  { path: '/about', expectedHeading: /Sydney-made acrylic decor/ },
  { path: '/faq', expectedHeading: /Common questions/ },
  { path: '/shipping', expectedHeading: /Shipping & returns/ },
  { path: '/contact', expectedHeading: /Get in touch/ },
  { path: '/care', expectedHeading: /Keeping your piece looking new/ },
];

for (const { path, expectedHeading } of PAGES) {
  test(`${path} renders with the expected heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible();
  });
}

test('sitemap.xml lists product URLs', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  expect(body).toContain('/shop/mia-heart-baby');
  expect(body).toContain('/customize');
});

test('robots.txt allows crawling and references sitemap', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  expect(body).toMatch(/Sitemap:.*sitemap\.xml/);
});
