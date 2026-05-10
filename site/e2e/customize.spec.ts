import { test, expect } from '@playwright/test';

test('/customize loads the designer with the default Alex piece', async ({ page }) => {
  await page.goto('/customize');

  // Header from the route's loading state, then the designer mounts.
  // The control panel renders the piece title once geometry is built.
  await expect(page.getByRole('heading', { name: /Alex.*bold sans plaque/ })).toBeVisible({
    timeout: 30_000,
  });

  // The 3D canvas is mounted (R3F creates a <canvas>).
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // The Your-text input pre-fills with the template's default text.
  const textInput = page.locator('input.text-input').first();
  await expect(textInput).toHaveValue('Alex');
});

test('/customize lets the customer change the foreground text', async ({ page }) => {
  await page.goto('/customize');
  await expect(page.getByRole('heading', { name: /Alex/ })).toBeVisible({ timeout: 30_000 });

  const textInput = page.locator('input.text-input').first();
  await textInput.fill('Sophia');
  // Geometry rebuild is debounced via useDeferredValue — wait briefly.
  await page.waitForTimeout(1500);

  // The chars counter in the panel header reflects the new text.
  await expect(page.getByText('6 chars')).toBeVisible();
});
