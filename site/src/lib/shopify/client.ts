import { createStorefrontApiClient } from '@shopify/storefront-api-client';

/**
 * Storefront API singleton. Reads from process.env at module load so server
 * components and route handlers all share one client. Token is safe to ship
 * to the browser (Storefront tokens are public-by-design); we still keep
 * this module server-rendered to avoid an extra round-trip — every public
 * page that needs catalog data is already an RSC.
 *
 * Env vars are sourced from a custom app in Shopify admin → Settings → Apps
 * and sales channels → Develop apps. See Plan/build/phase-3-headless-shopify.md.
 */
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

if (!domain || !token) {
  // Lazy-fail at first query instead of at import time so `next build` (which
  // tree-shakes server modules even when their env isn't set) still passes
  // when SHOPIFY_* aren't configured yet. The error surfaces at the first
  // actual storefront call, which is what we want during Phase 3 rollout.
}

export const storefront = createStorefrontApiClient({
  storeDomain: domain || 'placeholder.myshopify.com',
  apiVersion: '2025-01',
  publicAccessToken: token || 'placeholder-token',
});

/**
 * Tiny wrapper that re-throws a more useful error if the env wasn't set —
 * the upstream client's "Missing access token" message is confusing the
 * first time you see it during local setup.
 */
export async function storefrontRequest<TData>(
  operation: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  if (!domain || !token) {
    throw new Error(
      'Shopify Storefront API is not configured. Set SHOPIFY_STORE_DOMAIN and ' +
        'SHOPIFY_STOREFRONT_TOKEN in your environment. See Plan/build/phase-3-headless-shopify.md.',
    );
  }
  const { data, errors } = await storefront.request<TData>(operation, { variables });
  if (errors) {
    throw new Error(
      `Storefront API error: ${errors.graphQLErrors?.map((e) => e.message).join('; ') ?? 'unknown'}`,
    );
  }
  if (!data) {
    throw new Error('Storefront API returned no data');
  }
  return data;
}
