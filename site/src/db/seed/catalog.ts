import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { categories, products, productImages, productCategories } from '../schema/catalog';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

interface SeedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  widthCm: number;
  featured: boolean;
  materialsSummary: string;
  imageUrl: string;
  imageAlt: string;
  categoryIds: string[];
}

const SEED_CATEGORIES = [
  // Occasions — who/why you're buying.
  { id: 'cat-personal', slug: 'personal-milestones', name: 'Personal milestones', kind: 'occasion' as const, sortOrder: 1 },
  { id: 'cat-public', slug: 'public-holidays', name: 'Public holidays', kind: 'occasion' as const, sortOrder: 2 },
  { id: 'cat-religious', slug: 'religious-holidays', name: 'Religious holidays', kind: 'occasion' as const, sortOrder: 3 },
  { id: 'cat-corporate', slug: 'corporate-gifts', name: 'Corporate gifts', kind: 'occasion' as const, sortOrder: 4 },
  { id: 'cat-home', slug: 'home-decor', name: 'Home decor', kind: 'occasion' as const, sortOrder: 5 },
  // Product types — what you're buying.
  { id: 'type-name-plaque', slug: 'name-plaques', name: 'Name plaques', kind: 'product_type' as const, sortOrder: 10 },
  { id: 'type-cake-topper', slug: 'cake-toppers', name: 'Cake toppers', kind: 'product_type' as const, sortOrder: 11 },
  { id: 'type-mirror', slug: 'mirrors', name: 'Mirrors', kind: 'product_type' as const, sortOrder: 12 },
  { id: 'type-door-sign', slug: 'door-signs', name: 'Door signs', kind: 'product_type' as const, sortOrder: 13 },
  { id: 'type-ornament', slug: 'ornaments', name: 'Ornaments', kind: 'product_type' as const, sortOrder: 14 },
];

// Procedurally-generated SVG placeholder images (data URLs) so the storefront
// renders without external photo hosting. Real photography lands later.
function placeholderImage(label: string, accent: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3ede0"/>
      <stop offset="100%" stop-color="#dcd3bd"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect x="160" y="200" width="480" height="200" rx="12" fill="${accent}" opacity="0.85"/>
  <rect x="180" y="220" width="440" height="160" rx="8" fill="#2c2920"/>
  <text x="400" y="320" font-family="Georgia, serif" font-style="italic" font-size="64" font-weight="600" fill="#f5f3ee" text-anchor="middle">${label}</text>
</svg>`.trim();
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: 'prod-aisha-first-eid',
    slug: 'aisha-first-eid-plaque',
    name: '"Aisha\'s First Eid" Plaque',
    description:
      'A two-layer plaque celebrating a first Eid. Cream matte foreground over a gold mirror base creates a halo around the script.',
    priceCents: 8500,
    widthCm: 35,
    featured: true,
    materialsSummary: 'Cream matte over gold mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Aisha', '#d6b769'),
    imageAlt: '"Aisha\'s First Eid" multi-layer acrylic name plaque',
    categoryIds: ['cat-religious', 'cat-personal', 'type-name-plaque'],
  },
  {
    id: 'prod-olivia-frame',
    slug: 'olivia-circular-frame',
    name: '"Olivia" Circular Frame',
    description:
      'A round monogram piece with the name embedded inside a delicate ring of laser-cut acrylic.',
    priceCents: 7200,
    widthCm: 28,
    featured: true,
    materialsSummary: 'White matte over silver mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Olivia', '#c8c8d0'),
    imageAlt: '"Olivia" circular acrylic name frame',
    categoryIds: ['cat-personal', 'cat-home', 'type-mirror'],
  },
  {
    id: 'prod-mia-heart',
    slug: 'mia-heart-baby',
    name: '"Mia" Heart Plaque',
    description:
      'A three-layer heart with a name embedded inside. Designed for baby showers and christenings.',
    priceCents: 9800,
    widthCm: 28,
    featured: true,
    materialsSummary: 'Dusty pink matte heart, white gloss text, silver mirror base · 5 mm acrylic',
    imageUrl: placeholderImage('Mia', '#d3a4a4'),
    imageAlt: '"Mia" heart-shaped multi-layer acrylic plaque',
    categoryIds: ['cat-personal', 'type-name-plaque'],
  },
  {
    id: 'prod-yusuf-bilingual',
    slug: 'yusuf-bilingual-stacked',
    name: '"Yusuf 雨石" Bilingual Plaque',
    description:
      'A stacked bilingual name plaque with English script paired with Chinese characters. Custom orders accept any two scripts.',
    priceCents: 11500,
    widthCm: 38,
    featured: false,
    materialsSummary: 'Black mirror over rose gold mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Yusuf 雨石', '#15161a'),
    imageAlt: '"Yusuf 雨石" bilingual stacked acrylic plaque',
    categoryIds: ['cat-personal', 'type-name-plaque'],
  },
  {
    id: 'prod-mj-monogram',
    slug: 'mj-wedding-monogram',
    name: '"M & J" Wedding Monogram',
    description:
      'Two large initials side by side, ampersand between, on a unified gold mirror base. A wedding centerpiece.',
    priceCents: 13800,
    widthCm: 50,
    featured: true,
    materialsSummary: 'Cream matte over gold mirror · 6 mm acrylic',
    imageUrl: placeholderImage('M & J', '#d6b769'),
    imageAlt: '"M & J" wedding monogram acrylic centerpiece',
    categoryIds: ['cat-personal', 'cat-home', 'type-name-plaque'],
  },
  {
    id: 'prod-snowflake-set',
    slug: 'snowflake-ornament-set',
    name: 'Frosted Snowflake Ornament Set',
    description:
      'A set of three laser-cut frosted clear acrylic snowflakes. Strung with ribbon for tree hanging.',
    priceCents: 4200,
    widthCm: 12,
    featured: false,
    materialsSummary: 'Frosted clear · 3 mm acrylic',
    imageUrl: placeholderImage('Snowflakes', '#dde1e3'),
    imageAlt: 'Set of three frosted acrylic snowflake ornaments',
    categoryIds: ['cat-public', 'cat-home', 'type-ornament'],
  },
  {
    id: 'prod-easter-egg-name',
    slug: 'easter-egg-name-plaque',
    name: 'Easter Egg Name Plaque',
    description: "A pastel matte egg with the child's name laser-cut and bonded above.",
    priceCents: 5800,
    widthCm: 22,
    featured: false,
    materialsSummary: 'Baby blue matte over cream matte · 4 mm acrylic',
    imageUrl: placeholderImage('Easter', '#b6c8d6'),
    imageAlt: 'Easter egg-shaped acrylic name plaque',
    categoryIds: ['cat-public', 'cat-personal', 'type-name-plaque'],
  },
  {
    id: 'prod-rangoli-diwali',
    slug: 'rangoli-diwali-decoration',
    name: 'Diwali Rangoli Wall Piece',
    description:
      'A geometric mandala wall ornament cut from gold mirror acrylic. Designed for Diwali but reads as year-round home decor.',
    priceCents: 9500,
    widthCm: 40,
    featured: false,
    materialsSummary: 'Gold mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Diwali', '#d6b769'),
    imageAlt: 'Diwali rangoli mandala acrylic wall piece',
    categoryIds: ['cat-religious', 'cat-home', 'type-ornament'],
  },
  {
    id: 'prod-corporate-mia-daniel',
    slug: 'corporate-mia-daniel',
    name: '"Mia & Daniel" Corporate Gift Plaque',
    description:
      'Custom name plaque for corporate gifting. Choose a recipient name and we make a piece in our standard sans plaque format.',
    priceCents: 8800,
    widthCm: 32,
    featured: false,
    materialsSummary: 'Black matte over silver mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Mia & Daniel', '#c8c8d0'),
    imageAlt: 'Corporate name plaque example "Mia & Daniel"',
    categoryIds: ['cat-corporate', 'type-name-plaque'],
  },
  {
    id: 'prod-best-dad',
    slug: 'best-dad-fathers-day',
    name: '"Best Dad" Father\'s Day Plaque',
    description:
      "A bold sans plaque celebrating Father's Day. Black matte foreground on a gold halo base.",
    priceCents: 6500,
    widthCm: 30,
    featured: false,
    materialsSummary: 'Black matte over gold mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Best Dad', '#d6b769'),
    imageAlt: '"Best Dad" Father\'s Day acrylic plaque',
    categoryIds: ['cat-public', 'type-name-plaque'],
  },
];

async function main() {
  console.log('Seeding catalog…');
  await db.transaction(async (tx) => {
    // Wipe in dependency-safe order.
    await tx.delete(productCategories);
    await tx.delete(productImages);
    await tx.delete(products);
    await tx.delete(categories);

    await tx.insert(categories).values(SEED_CATEGORIES);

    for (const p of SEED_PRODUCTS) {
      await tx.insert(products).values({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        widthCm: p.widthCm,
        featured: p.featured,
        materialsSummary: p.materialsSummary,
      });
      await tx.insert(productImages).values({
        id: `${p.id}-img-1`,
        productId: p.id,
        url: p.imageUrl,
        alt: p.imageAlt,
        sortOrder: 0,
      });
      for (const cid of p.categoryIds) {
        await tx.insert(productCategories).values({
          productId: p.id,
          categoryId: cid,
        });
      }
    }
  });
  console.log(`Seeded ${SEED_CATEGORIES.length} categories, ${SEED_PRODUCTS.length} products.`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
