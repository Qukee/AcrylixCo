// Catalog queries — Shopify-backed as of Phase 3 B.3. Public exports are
// unchanged so the PDP / /shop / home page don't need to be updated when the
// data source moves. The Drizzle-backed implementation lived here until the
// 2026-05-11 cutover; see `lib/shopify/products.ts` for the current
// implementation and `Plan/build/phase-3-headless-shopify.md` for rationale.

export type {
  ProductFilters,
  ProductSummary,
  CategorySummary,
} from '@/lib/shopify/products';
export {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategory,
  getRelatedProducts,
  getAllCategories,
  getOccasionCategories,
  getProductTypeCategories,
} from '@/lib/shopify/products';
