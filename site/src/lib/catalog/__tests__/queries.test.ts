import { describe, it, expect, beforeAll } from 'vitest';
import 'dotenv/config';
import type * as Queries from '../queries';

// Skip these tests if DATABASE_URL is the build-time placeholder. They require
// the local seeded DB and are run via the same process.
const isPlaceholder =
  !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('build-placeholder');

describe.skipIf(isPlaceholder)('catalog queries (requires local seeded DB)', () => {
  let queries: typeof Queries;
  beforeAll(async () => {
    queries = await import('../queries');
  });

  it('getAllProducts returns the 10 seeded products', async () => {
    const products = await queries.getAllProducts();
    expect(products.length).toBe(10);
    for (const p of products) {
      expect(p.primaryImage).not.toBeNull();
    }
  });

  it('getFeaturedProducts returns at most the requested limit', async () => {
    const featured = await queries.getFeaturedProducts(3);
    expect(featured.length).toBeLessThanOrEqual(3);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it('getProductBySlug returns null for unknown slug', async () => {
    const result = await queries.getProductBySlug('does-not-exist');
    expect(result).toBeNull();
  });

  it('getProductBySlug returns product + images + categories for known slug', async () => {
    const result = await queries.getProductBySlug('mia-heart-baby');
    expect(result).not.toBeNull();
    expect(result!.product.name).toContain('Mia');
    expect(result!.images.length).toBeGreaterThan(0);
    expect(result!.categories.length).toBeGreaterThan(0);
  });

  it('getProductsByCategory filters correctly', async () => {
    const personal = await queries.getProductsByCategory('personal-milestones');
    expect(personal.length).toBeGreaterThan(0);
    const corporate = await queries.getProductsByCategory('corporate-gifts');
    expect(corporate.length).toBeGreaterThanOrEqual(1);
  });
});
