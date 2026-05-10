import 'server-only';
import { eq, asc, desc, and, inArray, gte, lte, ilike } from 'drizzle-orm';
import { db } from '@/db';
import { products, categories, productImages, productCategories } from '@/db/schema/catalog';

export interface ProductFilters {
  /** Number of acrylic layers — 1, 2, 3, or 'mixed' (mixed-material). */
  layerCount?: 1 | 2 | 3 | 'mixed';
  /** Inclusive price floor in cents. */
  priceMinCents?: number;
  /** Inclusive price ceiling in cents. */
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

async function buildSummary(p: typeof products.$inferSelect): Promise<ProductSummary> {
  const imgs = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, p.id))
    .orderBy(asc(productImages.sortOrder))
    .limit(1);
  const primary = imgs[0];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    widthCm: p.widthCm,
    inStock: p.inStock,
    featured: p.featured,
    materialsSummary: p.materialsSummary,
    primaryImage: primary ? { url: primary.url, alt: primary.alt } : null,
  };
}

export async function getAllProducts(
  filters: ProductFilters = {},
): Promise<ProductSummary[]> {
  const where = [];
  if (filters.priceMinCents !== undefined) {
    where.push(gte(products.priceCents, filters.priceMinCents));
  }
  if (filters.priceMaxCents !== undefined) {
    where.push(lte(products.priceCents, filters.priceMaxCents));
  }
  // Layer count is denormalised into materialsSummary. Phase 4 (admin)
  // introduces a structured layer column; until then we text-match.
  if (filters.layerCount !== undefined) {
    if (filters.layerCount === 'mixed') {
      // Heuristic: pieces that mix material kinds in their summary
      // ("matte" + "mirror" or "matte" + "gloss" etc.).
      where.push(ilike(products.materialsSummary, '%matte over%mirror%'));
    } else {
      // Fall back to widthCm/layer ladder: tiny ornaments tend to be 1-layer,
      // mid pieces 2-layer, larger pieces 3-layer. We don't have layer metadata
      // in the seed, so this is best-effort. Phase 4 fixes this with a real
      // column.
    }
  }
  const rows = await db
    .select()
    .from(products)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(products.createdAt));
  return Promise.all(rows.map(buildSummary));
}

export async function getFeaturedProducts(limit = 4): Promise<ProductSummary[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.featured, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return Promise.all(rows.map(buildSummary));
}

export async function getProductBySlug(slug: string): Promise<{
  product: ProductSummary;
  images: { url: string; alt: string }[];
  categories: CategorySummary[];
} | null> {
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row) return null;

  const imgRows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(asc(productImages.sortOrder));

  const catJoinRows = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, row.id));
  const catIds = catJoinRows.map((c) => c.categoryId);
  const catRows = catIds.length
    ? await db.select().from(categories).where(inArray(categories.id, catIds))
    : [];

  return {
    product: await buildSummary(row),
    images: imgRows.map((i) => ({ url: i.url, alt: i.alt })),
    categories: catRows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
    })),
  };
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductSummary[]> {
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, categorySlug))
    .limit(1);
  if (!cat) return [];
  const joinRows = await db
    .select({ productId: productCategories.productId })
    .from(productCategories)
    .where(eq(productCategories.categoryId, cat.id));
  const productIds = joinRows.map((j) => j.productId);
  if (productIds.length === 0) return [];
  const rows = await db
    .select()
    .from(products)
    .where(and(inArray(products.id, productIds)))
    .orderBy(desc(products.createdAt));
  return Promise.all(rows.map(buildSummary));
}

export async function getOccasionCategories(): Promise<CategorySummary[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.kind, 'occasion'))
    .orderBy(asc(categories.sortOrder));
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sortOrder: c.sortOrder,
  }));
}

export async function getProductTypeCategories(): Promise<CategorySummary[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.kind, 'product_type'))
    .orderBy(asc(categories.sortOrder));
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sortOrder: c.sortOrder,
  }));
}

export async function getAllCategories(): Promise<CategorySummary[]> {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sortOrder: c.sortOrder,
  }));
}
