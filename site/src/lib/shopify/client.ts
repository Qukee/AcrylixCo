import { createStorefrontApiClient } from '@shopify/storefront-api-client';

/**
 * Storefront API singleton. Works in both server and client contexts because
 * we read the public-safe NEXT_PUBLIC_* env vars. The public Storefront token
 * is designed by Shopify to ship to the browser — that's how Cart mutations
 * happen from React components.
 *
 * Source: Shopify admin → Headless sales channel → Storefront API tokens.
 * See Plan/build/phase-3-headless-shopify.md and reference_shopify.md.
 */
const domain =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
const token =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || process.env.SHOPIFY_STOREFRONT_TOKEN;

export const storefront = createStorefrontApiClient({
  storeDomain: domain || 'placeholder.myshopify.com',
  apiVersion: '2026-04',
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
      `Storefront API error: ${
        errors.graphQLErrors?.map((e) => e.message).join('; ') ?? 'unknown'
      }`,
    );
  }
  if (!data) {
    throw new Error('Storefront API returned no data');
  }
  return data;
}
