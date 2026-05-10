import type { MetadataRoute } from 'next';

const BASE_URL = process.env.AUTH_URL ?? 'https://acrylixco-production.up.railway.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
