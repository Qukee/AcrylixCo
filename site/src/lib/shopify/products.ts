import 'server-only';
import { storefrontRequest } from './client';
import type { ShopifyImage, ShopifyMoney, ShopifyVariant } from './types';

// Public catalog types — match the pre-Shopify shape exactly so consumers
// (PDP, /shop, home page) don't need code changes. When Shopify is wired
// up, `lib/catalog/queries.ts` re-exports from this module.

export interface ProductFilters {
  layerCount?: 1 | 2 | 3 | 'mixed';
  priceMinCents?: number;
  priceMaxCents?: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  widthCm: number;
  inStock: boolean;
  featured: boolean;
  materialsSummary: string;
  primaryImage: { url: string; alt: string } | null;
}

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

// GraphQL response shapes — only the fields we project below.
interface RawProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  collections: { nodes: Array<{ handle: string; title: string; description: string }> };
}

interface RawCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

// Per-product fallback when we don't yet have Shopify metafields wired up
// for the AcrylixCo-specific fields (materialsSummary, widthCm).
// Keyed by handle. Add an entry when you add a new product to Shopify.
const PRODUCT_DEFAULTS: Record<string, { materialsSummary: string; widthCm: number }> = {
  'big-letter-sign': {
    materialsSummary: 'Blush pink matte over ivory · 5 mm acrylic',
    widthCm: 38,
  },
};

const DEFAULT_DEFAULTS = {
  materialsSummary: 'Multi-layer acrylic',
  widthCm: 30,
};

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
        width
        height
      }
    }
    variants(first: 1) {
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
    collections(first: 10) {
      nodes {
        handle
        title
        description
      }
    }
  }
`;

function moneyToCents(money: ShopifyMoney | undefined): number {
  if (!money) return 0;
  // Storefront API returns amount as a decimal string e.g. "72.00".
  return Math.round(parseFloat(money.amount) * 100);
}

function image(node: ShopifyImage | null): { url: string; alt: string } | null {
  if (!node) return null;
  return { url: node.url, alt: node.altText ?? '' };
}

function toSummary(p: RawProduct): ProductSummary {
  const variant = p.variants.nodes[0];
  const defaults = PRODUCT_DEFAULTS[p.handle] ?? DEFAULT_DEFAULTS;
  return {
    id: p.id,
    slug: p.handle,
    name: p.title,
    description: p.description,
    priceCents: moneyToCents(variant?.price),
    widthCm: defaults.widthCm,
    inStock: p.availableForSale,
    // No Shopify boolean for "featured" — we treat anything in the catalog as
    // featurable for now. Future: tag-driven (e.g. "featured" tag) or a
    // metafield.
    featured: true,
    materialsSummary: defaults.materialsSummary,
    primaryImage: image(p.featuredImage),
  };
}

function toCategorySummary(c: RawCollection, sortOrder: number): CategorySummary {
  return {
    id: c.id,
    slug: c.handle,
    name: c.title,
    description: c.description || null,
    sortOrder,
  };
}

export async function getAllProducts(
  filters: ProductFilters = {},
): Promise<ProductSummary[]> {
  const data = await storefrontRequest<{ products: { nodes: RawProduct[] } }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query AllProducts {
        products(first: 50) {
          nodes {
            ...ProductFields
          }
        }
      }
    `,
  );
  let summaries = data.products.nodes.map(toSummary);
  if (filters.priceMinCents !== undefined) {
    summaries = summaries.filter((s) => s.priceCents >= filters.priceMinCents!);
  }
  if (filters.priceMaxCents !== undefined) {
    summaries = summaries.filter((s) => s.priceCents <= filters.priceMaxCents!);
  }
  return summaries;
}

export async function getFeaturedProducts(limit = 4): Promise<ProductSummary[]> {
  const data = await storefrontRequest<{ products: { nodes: RawProduct[] } }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query FeaturedProducts($limit: Int!) {
        products(first: $limit, sortKey: BEST_SELLING) {
          nodes {
            ...ProductFields
          }
        }
      }
    `,
    { limit },
  );
  return data.products.nodes.map(toSummary);
}

export async function getProductBySlug(slug: string): Promise<{
  product: ProductSummary;
  images: { url: string; alt: string }[];
  categories: CategorySummary[];
  variantId: string;
} | null> {
  const data = await storefrontRequest<{ product: RawProduct | null }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query ProductByHandle($handle: String!) {
        product(handle: $handle) {
          ...ProductFields
        }
      }
    `,
    { handle: slug },
  );
  if (!data.product) return null;
  const variantId = data.product.variants.nodes[0]?.id ?? '';
  return {
    product: toSummary(data.product),
    images: data.product.images.nodes.map((n) => ({
      url: n.url,
      alt: n.altText ?? '',
    })),
    categories: data.product.collections.nodes.map((c, i) =>
      toCategorySummary({ id: '', handle: c.handle, title: c.title, description: c.description }, i),
    ),
    variantId,
  };
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<ProductSummary[]> {
  const data = await storefrontRequest<{
    collection: { products: { nodes: RawProduct[] } } | null;
  }>(
    /* GraphQL */ `
      ${PRODUCT_FRAGMENT}
      query CollectionProducts($handle: String!) {
        collection(handle: $handle) {
          products(first: 50) {
            nodes {
              ...ProductFields
            }
          }
        }
      }
    `,
    { handle: categorySlug },
  );
  if (!data.collection) return [];
  return data.collection.products.nodes.map(toSummary);
}

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  // Shopify's productRecommendations(productId) returns related items based
  // on its built-in model (collection co-membership, etc.). Falls back to
  // most-recent products if Shopify hasn't computed recommendations yet.
  try {
    const data = await storefrontRequest<{ productRecommendations: RawProduct[] | null }>(
      /* GraphQL */ `
        ${PRODUCT_FRAGMENT}
        query Related($productId: ID!) {
          productRecommendations(productId: $productId) {
            ...ProductFields
          }
        }
      `,
      { productId },
    );
    const recs = data.productRecommendations ?? [];
    if (recs.length > 0) return recs.slice(0, limit).map(toSummary);
  } catch {
    // Fall through to the fallback below.
  }
  // No recommendations yet (e.g. only one product in the catalog). Return
  // most-recent other products instead.
  const fallback = await getFeaturedProducts(limit + 1);
  return fallback.filter((p) => p.id !== productId).slice(0, limit);
}

async function getAllCollections(): Promise<CategorySummary[]> {
  const data = await storefrontRequest<{ collections: { nodes: RawCollection[] } }>(
    /* GraphQL */ `
      query AllCollections {
        collections(first: 50, sortKey: TITLE) {
          nodes {
            id
            handle
            title
            description
          }
        }
      }
    `,
  );
  return data.collections.nodes.map((c, i) => toCategorySummary(c, i + 1));
}

// Shopify Collections don't carry an "occasion vs product_type" axis natively
// — we map all collections to occasions for now (the user's current
// taxonomy: Kids / Islamic / Gifts is occasion-like). When the product
// type axis comes back, we'll either prefix collection handles
// (`type:cake-toppers` vs `occasion:weddings`) or use a metaobject.
export async function getAllCategories(): Promise<CategorySummary[]> {
  return getAllCollections();
}

export async function getOccasionCategories(): Promise<CategorySummary[]> {
  return getAllCollections();
}

export async function getProductTypeCategories(): Promise<CategorySummary[]> {
  // No product-type collections yet — return empty so the "By the piece"
  // home section collapses. We'll re-introduce this when the catalog has
  // dedicated type collections (Cake toppers, Mirrors, etc.).
  return [];
}
