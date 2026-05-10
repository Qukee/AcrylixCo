import type { MetadataRoute } from 'next';
import { getAllProducts, getAllCategories } from '@/lib/catalog/queries';

// Sitemap hits the DB. Railway doesn't inject env vars at Docker build time —
// without `force-dynamic`, the build tries to prerender this and crashes on
// the placeholder DATABASE_URL.
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.AUTH_URL ?? 'https://acrylixco-production.up.railway.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  const staticPages = [
    '',
    '/shop',
    '/customize',
    '/about',
    '/faq',
    '/shipping',
    '/contact',
    '/care',
  ];

  return [
    ...staticPages.map((p) => ({
      url: `${BASE_URL}${p}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1.0 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${BASE_URL}/shop/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${BASE_URL}/shop/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
