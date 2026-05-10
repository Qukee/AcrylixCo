# Phase 2 — Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing AcrylixCo storefront — catalog browsing, product detail pages, content pages, and SEO essentials — turning the existing "coming soon" hero into a real landing page that drives customers to either pre-made products or the `/customize` designer (already shipped in Phase 1).

**Architecture:** Server-rendered Next.js routes (App Router, server components by default) reading from a new Drizzle catalog schema. No client-side fetching for catalog browsing — every page renders on the server with full HTML for SEO. Content pages (About, FAQ, etc.) are TSX with the storefront design system. Cart, accounts, checkout are still Phase 3.

**Tech Stack:** existing Next 16 + Tailwind v4 + Drizzle + Zod; no new dependencies needed.

**Out of scope:** Cart UI, checkout, accounts, payments, real photography (using procedural / placeholder images), search-engine indexing performance optimisation beyond Core Web Vitals basics, reviews, wishlist persistence, cookie consent + GA4 (deferred to a Phase 2.5 polish pass), email notifications, admin product editor (Phase 4).

**Source of truth for UI patterns**: the existing `site/src/components/site/Header.tsx` + `Footer.tsx` and the Tailwind v4 theme tokens in `site/src/app/globals.css` (cream / ink / accent / Bricolage / Fraunces / JetBrains Mono).

---

## Task 1: Storefront design primitives

Build the small set of reusable components that Phase 2 depends on. Doing it first means every page below benefits from a consistent visual language.

**Files:**
- Create: `site/src/components/site/Container.tsx`
- Create: `site/src/components/site/Button.tsx`
- Create: `site/src/components/site/SectionTitle.tsx`
- Create: `site/src/components/site/__tests__/Button.test.tsx`

- [ ] **Step 1: Container**

Path: `site/src/components/site/Container.tsx`

```tsx
import type { HTMLAttributes } from 'react';

export function Container({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-7xl px-6 ${className}`} {...rest} />;
}
```

- [ ] **Step 2: Button — primary, ghost, link variants**

Path: `site/src/components/site/Button.tsx`

```tsx
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'link';
type Size = 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-cream-50 hover:bg-ink-700 active:translate-y-px transition-colors',
  ghost:
    'border border-ink-700 text-ink-900 hover:bg-cream-50 active:translate-y-px transition-colors',
  link: 'text-ink-700 underline underline-offset-4 hover:text-ink-900 transition-colors',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<'button'> & { href?: undefined };
type LinkButtonProps = BaseProps & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = 'primary', size = 'md', className = '', children, ...rest } = props;
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-mono text-xs uppercase tracking-[0.16em] ${variants[variant]} ${sizes[size]} ${className}`;
  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest;
    return (
      <Link href={href} className={cls} {...anchorRest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...(rest as ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: SectionTitle — eyebrow + heading pattern**

Path: `site/src/components/site/SectionTitle.tsx`

```tsx
interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionTitle({ eyebrow, title, description, align = 'left' }: SectionTitleProps) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl italic md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 max-w-2xl text-ink-700 md:text-lg">{description}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Test the Button**

Path: `site/src/components/site/__tests__/Button.test.tsx`

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders a button by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders an anchor when href is provided', () => {
    render(<Button href="/shop">Shop</Button>);
    const link = screen.getByRole('link', { name: 'Shop' });
    expect(link).toHaveAttribute('href', '/shop');
  });

  it('applies the ghost variant classes', () => {
    render(<Button variant="ghost">Browse</Button>);
    const btn = screen.getByRole('button', { name: 'Browse' });
    expect(btn.className).toMatch(/border-ink-700/);
  });
});
```

- [ ] **Step 5: Run tests, verify**

```bash
cd site
npm run test
npm run typecheck
npm run lint
```

Expected: all pass, +3 new tests.

- [ ] **Step 6: Commit**

```bash
cd ..
git add site/src/components/site/
git commit -m "feat(site): storefront design primitives (Container, Button, SectionTitle)"
```

---

## Task 2: Catalog Drizzle schema

Define the database tables for the product catalog. No real data yet — that's Task 3.

**Files:**
- Create: `site/src/db/schema/catalog.ts`
- Modify: `site/src/db/schema/index.ts`
- Migration: generated by drizzle-kit

- [ ] **Step 1: Write the schema**

Path: `site/src/db/schema/catalog.ts`

```ts
import { pgTable, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  /** Price in cents (AUD). */
  priceCents: integer('price_cents').notNull(),
  /** Approximate width in centimetres for display. */
  widthCm: integer('width_cm').notNull(),
  /** Stock-keeping flag. */
  inStock: boolean('in_stock').notNull().default(true),
  /** Featured on the home page. */
  featured: boolean('featured').notNull().default(false),
  /** Manufacturing materials summary (denormalised for catalog display). */
  materialsSummary: text('materials_summary').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productImages = pgTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

/** Many-to-many between products and categories. */
export const productCategories = pgTable(
  'product_categories',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.productId, t.categoryId] }) }),
);

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  categories: many(productCategories),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories),
}));
```

- [ ] **Step 2: Re-export from the schema barrel**

Path: `site/src/db/schema/index.ts` — append:

```ts
export * from './catalog';
```

- [ ] **Step 3: Generate the migration**

```bash
cd site
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npx drizzle-kit generate
```

Expected: a new SQL file under `src/db/migrations/`.

- [ ] **Step 4: Apply locally**

```bash
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npx drizzle-kit migrate
psql postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco -c "\dt"
```

Expected: `products`, `product_images`, `categories`, `product_categories` tables present.

- [ ] **Step 5: Verify typecheck**

```bash
npm run typecheck
```

The schema barrel adds re-exports — no consumers yet so nothing should break.

- [ ] **Step 6: Commit**

```bash
cd ..
git add site/src/db/
git commit -m "feat(catalog): drizzle schema for products, images, categories"
```

The migration auto-applies on the next Railway deploy (the Dockerfile CMD runs `drizzle-kit migrate` on container start).

---

## Task 3: Seed sample catalog data

Without products to display, every page below renders empty. Seed a representative cross-section of AcrylixCo's typical inventory.

**Files:**
- Create: `site/src/db/seed/catalog.ts`
- Modify: `site/package.json` (add `db:seed` script)

- [ ] **Step 1: Write the seed**

Path: `site/src/db/seed/catalog.ts`

```ts
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
  { id: 'cat-personal', slug: 'personal-milestones', name: 'Personal milestones', sortOrder: 1 },
  { id: 'cat-public', slug: 'public-holidays', name: 'Public holidays', sortOrder: 2 },
  { id: 'cat-religious', slug: 'religious-holidays', name: 'Religious holidays', sortOrder: 3 },
  { id: 'cat-corporate', slug: 'corporate-gifts', name: 'Corporate gifts', sortOrder: 4 },
  { id: 'cat-home', slug: 'home-decor', name: 'Home decor', sortOrder: 5 },
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
    categoryIds: ['cat-religious', 'cat-personal'],
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
    categoryIds: ['cat-personal', 'cat-home'],
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
    categoryIds: ['cat-personal'],
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
    categoryIds: ['cat-personal'],
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
    categoryIds: ['cat-personal', 'cat-home'],
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
    categoryIds: ['cat-public', 'cat-home'],
  },
  {
    id: 'prod-easter-egg-name',
    slug: 'easter-egg-name-plaque',
    name: 'Easter Egg Name Plaque',
    description: 'A pastel matte egg with the child\'s name laser-cut and bonded above.',
    priceCents: 5800,
    widthCm: 22,
    featured: false,
    materialsSummary: 'Baby blue matte over cream matte · 4 mm acrylic',
    imageUrl: placeholderImage('Easter', '#b6c8d6'),
    imageAlt: 'Easter egg-shaped acrylic name plaque',
    categoryIds: ['cat-public', 'cat-personal'],
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
    categoryIds: ['cat-religious', 'cat-home'],
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
    categoryIds: ['cat-corporate'],
  },
  {
    id: 'prod-best-dad',
    slug: 'best-dad-fathers-day',
    name: '"Best Dad" Father\'s Day Plaque',
    description: 'A bold sans plaque celebrating Father\'s Day. Black matte foreground on a gold halo base.',
    priceCents: 6500,
    widthCm: 30,
    featured: false,
    materialsSummary: 'Black matte over gold mirror · 5 mm acrylic',
    imageUrl: placeholderImage('Best Dad', '#d6b769'),
    imageAlt: '"Best Dad" Father\'s Day acrylic plaque',
    categoryIds: ['cat-public'],
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
```

- [ ] **Step 2: Add `db:seed` script and `dotenv` dep**

```bash
cd site
npm install --save-dev dotenv tsx
```

Add to `site/package.json` `"scripts"`:

```json
"db:seed": "tsx src/db/seed/catalog.ts"
```

- [ ] **Step 3: Run the seed locally**

```bash
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npm run db:seed
psql postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco -c "SELECT count(*) FROM products;"
psql postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco -c "SELECT count(*) FROM categories;"
```

Expected: 10 products, 5 categories.

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/src/db/seed/ site/package.json site/package-lock.json
git commit -m "feat(catalog): seed 10 sample products across 5 categories"
```

Production (Railway) seed: run `RAILWAY_TOKEN=... railway run npm run db:seed --service AcrylixCo` from local OR seed via Railway shell. **Document this in the commit message** but do not auto-run on every deploy (the Dockerfile CMD must NOT include `db:seed`).

---

## Task 4: Catalog data layer

Server-side query functions for catalog browsing. Pure functions over the Drizzle client. No API routes needed — server components call them directly.

**Files:**
- Create: `site/src/lib/catalog/queries.ts`
- Create: `site/src/lib/catalog/__tests__/queries.test.ts`

- [ ] **Step 1: Write the query functions**

Path: `site/src/lib/catalog/queries.ts`

```ts
import 'server-only';
import { eq, asc, desc, and, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { products, categories, productImages, productCategories } from '@/db/schema/catalog';

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

export async function getAllProducts(): Promise<ProductSummary[]> {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
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
  const [cat] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
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
```

- [ ] **Step 2: Test against the seeded local DB**

Path: `site/src/lib/catalog/__tests__/queries.test.ts`

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import 'dotenv/config';

// Skip these tests if DATABASE_URL is the build-time placeholder. They require
// the local seeded DB and are run via the same process.
const isPlaceholder =
  !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('build-placeholder');

describe.skipIf(isPlaceholder)('catalog queries (requires local seeded DB)', () => {
  let queries: typeof import('../queries');
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
```

- [ ] **Step 3: Run tests with the seeded DB**

```bash
cd site
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npm run test
```

Expected: all tests pass (the `describe.skipIf(isPlaceholder)` will run them when DATABASE_URL is set; the existing 16 tests + ~5 new = 21+ passing).

- [ ] **Step 4: Verify build (placeholder DB scenario)**

Without DATABASE_URL set, the catalog query tests should skip. Build still works:

```bash
unset DATABASE_URL && npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd ..
git add site/src/lib/catalog/
git commit -m "feat(catalog): server-side query layer with tests"
```

---

## Task 5: ProductCard component + grid

The visual unit for catalog browsing. Used on home + /shop + category pages.

**Files:**
- Create: `site/src/components/site/ProductCard.tsx`
- Create: `site/src/components/site/ProductGrid.tsx`

- [ ] **Step 1: Write ProductCard**

Path: `site/src/components/site/ProductCard.tsx`

```tsx
import Link from 'next/link';
import type { ProductSummary } from '@/lib/catalog/queries';

interface ProductCardProps {
  product: ProductSummary;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProductCard({ product }: ProductCardProps) {
  const href = `/shop/${product.slug}`;
  const img = product.primaryImage;
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-md border border-cream-300/60 bg-cream-50 transition-colors hover:border-cream-400"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-cream-200">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-xl italic">{product.name}</h3>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
          {product.materialsSummary}
        </p>
        <p className="text-sm text-ink-700">
          {product.widthCm} cm wide
          {!product.inStock && (
            <span className="ml-2 text-ink-500">· back-order</span>
          )}
        </p>
        <p className="mt-2 font-mono text-sm tracking-wide text-ink-900">
          {formatPrice(product.priceCents)} AUD
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Write ProductGrid**

Path: `site/src/components/site/ProductGrid.tsx`

```tsx
import type { ProductSummary } from '@/lib/catalog/queries';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <p className="font-mono text-sm uppercase tracking-[0.14em] text-ink-500">
        No products yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
cd site && npm run typecheck && npm run lint
```

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/src/components/site/
git commit -m "feat(site): ProductCard + ProductGrid"
```

---

## Task 6: Real home page

Replace the "Coming soon" placeholder with a hero, featured products row, customise CTA, and category strip.

**Files:**
- Modify: `site/src/app/page.tsx`

- [ ] **Step 1: Rewrite the home page**

Path: `site/src/app/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { Button } from '@/components/site/Button';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { getFeaturedProducts, getAllCategories } from '@/lib/catalog/queries';
import Link from 'next/link';

export default async function HomePage() {
  const [featured, cats] = await Promise.all([getFeaturedProducts(4), getAllCategories()]);

  return (
    <>
      <section className="border-b border-cream-300/60">
        <Container className="py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
            Sydney · since 2024
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] md:text-7xl">
            Made-to-order acrylic decor for life&rsquo;s occasions.
          </h1>
          <p className="mt-6 max-w-xl text-ink-700 md:text-lg">
            Multi-layered, laser-cut pieces designed in Sydney. Pick from our shop, or design
            your own — every piece manufactured to order.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/shop" size="lg">
              Browse the shop
            </Button>
            <Button href="/customize" size="lg" variant="ghost">
              Design your own
            </Button>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 md:py-24">
          <SectionTitle
            eyebrow="Featured"
            title="Made for moments worth keeping."
            description="Our most-requested pieces, ready to ship or be made-to-order in your colours."
          />
          <div className="mt-12">
            <ProductGrid products={featured} />
          </div>
        </Container>
      </section>

      <section className="border-y border-cream-300/60 bg-cream-50">
        <Container className="py-16 md:py-24">
          <SectionTitle eyebrow="Browse" title="By the moment you&rsquo;re celebrating." />
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cats.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="block rounded-md border border-cream-300/60 bg-cream-100 p-6 transition-colors hover:border-cream-400 hover:bg-cream-50"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
                    Category
                  </p>
                  <h3 className="mt-2 font-serif text-2xl italic">{c.name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section>
        <Container className="py-20 md:py-28 text-center">
          <SectionTitle
            eyebrow="Customize"
            title="Or design something one of a kind."
            description="Pick a template, type the name, choose your finishes — see a 3D preview before you order."
            align="center"
          />
          <div className="mt-10 flex justify-center">
            <Button href="/customize" size="lg">
              Open the designer
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Update the existing E2E sanity spec to match new copy**

Path: `site/e2e/sanity.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('home page loads with hero, featured products, footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Made-to-order acrylic decor',
  );
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByText('AcrylixCo · Sydney, Australia')).toBeVisible();
  // Featured product links resolve into /shop/:slug.
  const productLinks = page.locator('a[href^="/shop/"]');
  await expect(productLinks.first()).toBeVisible();
});
```

- [ ] **Step 3: Run all checks**

```bash
cd site
npm run typecheck && npm run lint
```

- [ ] **Step 4: Verify locally with the seeded DB**

```bash
npm run dev
```

Open http://localhost:3000. Expected: hero, 4 featured products in a grid, category list, CTA.

- [ ] **Step 5: Commit**

```bash
cd ..
git add site/src/app/page.tsx site/e2e/
git commit -m "feat(site): real home page with hero, featured products, categories"
```

---

## Task 7: `/shop` list page

The all-products grid with category sidebar.

**Files:**
- Create: `site/src/app/shop/page.tsx`
- Create: `site/src/app/shop/CategorySidebar.tsx`

- [ ] **Step 1: Write the page**

Path: `site/src/app/shop/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { CategorySidebar } from './CategorySidebar';
import { getAllProducts, getAllCategories } from '@/lib/catalog/queries';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop — AcrylixCo',
  description:
    'Browse our pre-made multi-layered acrylic pieces — name plaques, monograms, ornaments, and more.',
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return (
    <Container className="py-16 md:py-24">
      <SectionTitle
        eyebrow="Shop"
        title="The full collection."
        description="Every piece is laser-cut to order in Sydney. Sizes are approximate; reach out for custom dimensions."
      />
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <CategorySidebar categories={categories} activeSlug={null} />
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Sidebar component**

Path: `site/src/app/shop/CategorySidebar.tsx`

```tsx
import Link from 'next/link';
import type { CategorySummary } from '@/lib/catalog/queries';

interface CategorySidebarProps {
  categories: CategorySummary[];
  activeSlug: string | null;
}

export function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
  return (
    <aside>
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
        Categories
      </h2>
      <ul className="mt-4 space-y-2">
        <li>
          <Link
            href="/shop"
            className={`block py-1.5 font-serif text-lg italic transition-colors ${
              activeSlug === null ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'
            }`}
          >
            All pieces
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/shop/${c.slug}`}
              className={`block py-1.5 font-serif text-lg italic transition-colors ${
                activeSlug === c.slug ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 3: Verify**

```bash
cd site && npm run typecheck && npm run lint
```

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/src/app/shop/
git commit -m "feat(shop): list page with all products + category sidebar"
```

---

## Task 8: Category page + product detail page

Two routes:
- `/shop/[slug]` — could be either a category OR a product slug. We resolve by checking the categories table first; if no category matches, treat the slug as a product. This avoids URL collisions and gives clean URLs.

**Files:**
- Create: `site/src/app/shop/[slug]/page.tsx`

- [ ] **Step 1: Write the route**

Path: `site/src/app/shop/[slug]/page.tsx`

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/site/Container';
import { Button } from '@/components/site/Button';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { CategorySidebar } from '../CategorySidebar';
import {
  getAllCategories,
  getProductBySlug,
  getProductsByCategory,
} from '@/lib/catalog/queries';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (product) {
    return {
      title: `${product.product.name} — AcrylixCo`,
      description: product.product.description,
    };
  }
  const cats = await getAllCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (cat) {
    return {
      title: `${cat.name} — Shop — AcrylixCo`,
      description: `Browse ${cat.name.toLowerCase()} acrylic pieces from AcrylixCo.`,
    };
  }
  return { title: 'Not found — AcrylixCo' };
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ShopSlugPage({ params }: RouteParams) {
  const { slug } = await params;

  // Try product first.
  const result = await getProductBySlug(slug);
  if (result) {
    const { product, images, categories } = result;
    return (
      <Container className="py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          <Link href="/shop" className="hover:text-ink-900">
            Shop
          </Link>
          {categories[0] && (
            <>
              {' / '}
              <Link href={`/shop/${categories[0].slug}`} className="hover:text-ink-900">
                {categories[0].name}
              </Link>
            </>
          )}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="grid gap-4">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt={img.alt}
                className="aspect-[4/3] w-full rounded-md bg-cream-200 object-cover"
              />
            ))}
          </div>

          <div>
            <h1 className="font-serif text-4xl italic">{product.name}</h1>
            <p className="mt-4 font-mono text-sm tracking-[0.14em] text-ink-500">
              {product.materialsSummary} · {product.widthCm} cm wide
            </p>
            <p className="mt-6 text-ink-700 md:text-lg">{product.description}</p>
            <p className="mt-8 font-serif text-3xl">{formatPrice(product.priceCents)} AUD</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg">Add to cart</Button>
              <Button href="/customize" size="lg" variant="ghost">
                Customize this design
              </Button>
            </div>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
              Made to order · ships from Sydney in 7–10 days
            </p>
          </div>
        </div>
      </Container>
    );
  }

  // Otherwise, treat as category slug.
  const cats = await getAllCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const products = await getProductsByCategory(slug);
  return (
    <Container className="py-16 md:py-24">
      <SectionTitle eyebrow="Shop" title={cat.name} description={cat.description ?? undefined} />
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <CategorySidebar categories={cats} activeSlug={cat.slug} />
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: Verify**

```bash
cd site && npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
cd ..
git add site/src/app/shop/
git commit -m "feat(shop): /shop/[slug] route handles both product and category slugs"
```

---

## Task 9: Static content pages (About, FAQ, Shipping, Contact, Care)

Per `Plan/19-seo-and-content.md`. Static for Phase 2; admin editing comes in Phase 4.

**Files:**
- Create: `site/src/app/about/page.tsx`
- Create: `site/src/app/faq/page.tsx`
- Create: `site/src/app/shipping/page.tsx`
- Create: `site/src/app/contact/page.tsx`
- Create: `site/src/app/care/page.tsx`

- [ ] **Step 1: About**

Path: `site/src/app/about/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — AcrylixCo',
  description: 'AcrylixCo makes multi-layered laser-cut acrylic decor in Sydney, Australia.',
};

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="About" title="Sydney-made acrylic decor for life's occasions." />
      <div className="prose mt-10 max-w-none font-serif text-lg text-ink-700">
        <p>
          AcrylixCo is a Sydney-based studio that makes multi-layered laser-cut acrylic pieces for
          life&rsquo;s milestones — births, weddings, religious holidays, corporate gifts.
        </p>
        <p>
          Every piece is built from at least two layers: a foreground (the name, monogram, or
          motif) bonded onto a base layer cut to follow the foreground&rsquo;s contour with an
          outward offset, creating a halo of colour around the design. Pieces are made to order —
          finished in mirror, matte, frosted, gloss, glitter, neon, or clear acrylic.
        </p>
        <p>
          We ship Australia-wide from our Sydney studio, with most orders posted within 7–10 days
          of confirmation.
        </p>
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: FAQ**

Path: `site/src/app/faq/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — AcrylixCo',
  description:
    'Common questions about AcrylixCo custom acrylic pieces — turnaround, materials, customization, and care.',
};

const FAQ = [
  {
    q: 'How long until my piece ships?',
    a: 'Most orders ship from Sydney within 7–10 business days of confirmation. For custom designs we email a proof for your approval before manufacturing begins, which can add 1–2 days.',
  },
  {
    q: 'What materials do you use?',
    a: 'We use cast acrylic in mirror, matte, frosted, gloss, glitter, neon, and clear finishes. Sheet thickness is typically 5 mm; smaller ornaments are 3 mm and larger pieces 6 mm.',
  },
  {
    q: 'Can I customize the size, colours, or text?',
    a: 'Yes. Use the customizer at /customize to design your own piece, or email us with details for a custom order based on a catalog template.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'We currently only ship within Australia. Reach out if you have a one-off international request and we can quote shipping.',
  },
  {
    q: 'What if my piece arrives damaged?',
    a: 'Email us with photos within 7 days of delivery and we will remake the piece at no additional cost.',
  },
  {
    q: 'How should I care for my acrylic piece?',
    a: 'See our Care page for full instructions — short version: dust with a soft cloth, avoid abrasive cleaners.',
  },
];

export default function FaqPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="FAQ" title="Common questions." />
      <dl className="mt-12 divide-y divide-cream-300/60">
        {FAQ.map((entry) => (
          <div key={entry.q} className="py-6">
            <dt className="font-serif text-xl italic">{entry.q}</dt>
            <dd className="mt-2 text-ink-700">{entry.a}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
```

- [ ] **Step 3: Shipping**

Path: `site/src/app/shipping/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Returns — AcrylixCo',
  description: 'AcrylixCo shipping rates, turnaround times, and return policy.',
};

export default function ShippingPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="Logistics" title="Shipping & returns." />
      <div className="prose mt-10 max-w-none font-serif text-lg text-ink-700">
        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Shipping</h3>
        <p>
          We ship Australia-wide via Australia Post. Standard parcel post is included on orders
          over $80 AUD. Express post is available at checkout for $14 AUD. Most orders are posted
          within 7–10 business days of confirmation.
        </p>

        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Returns</h3>
        <p>
          <strong>Made-to-order pieces (custom designs):</strong> non-returnable except in the case
          of manufacturing defects. We will remake any piece that arrives damaged or that
          materially differs from the approved design proof.
        </p>
        <p>
          <strong>Catalog pieces:</strong> returnable within 14 days for a refund minus return
          shipping, provided the piece is undamaged and unused.
        </p>
        <p>
          Email us at hello@acrylixco.com.au with photos within 7 days of delivery for damage or
          quality issues.
        </p>
      </div>
    </Container>
  );
}
```

- [ ] **Step 4: Contact**

Path: `site/src/app/contact/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — AcrylixCo',
  description: 'Get in touch with AcrylixCo for custom orders, wholesale, or support.',
};

export default function ContactPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle
        eyebrow="Contact"
        title="Get in touch."
        description="Whether it's a custom order, a wholesale enquiry, or a support question — we read every email."
      />
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">Email</p>
          <p className="mt-2 font-serif text-2xl italic">
            <a href="mailto:hello@acrylixco.com.au" className="text-ink-900 hover:underline">
              hello@acrylixco.com.au
            </a>
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">Studio</p>
          <p className="mt-2 font-serif text-2xl italic">Sydney, Australia</p>
          <p className="mt-1 text-ink-700">By appointment only.</p>
        </div>
      </div>
    </Container>
  );
}
```

- [ ] **Step 5: Care**

Path: `site/src/app/care/page.tsx`

```tsx
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Care Instructions — AcrylixCo',
  description: 'How to care for your AcrylixCo acrylic piece — cleaning, mounting, and storage.',
};

export default function CarePage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="Care" title="Keeping your piece looking new." />
      <div className="prose mt-10 max-w-none font-serif text-lg text-ink-700">
        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Cleaning</h3>
        <p>
          Dust with a soft microfibre cloth. For fingerprints or smudges, use a damp microfibre
          cloth with a drop of dish soap; rinse with clean water and dry. <strong>Avoid</strong>{' '}
          ammonia-based cleaners (e.g. Windex), abrasive sponges, or paper towels — they will
          scratch the surface over time.
        </p>

        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Mounting</h3>
        <p>
          Most pieces ship with a clear acrylic stand for tabletop display. For wall mounting, use
          double-sided mounting strips suitable for the piece&rsquo;s weight (Command 3M strips
          work well for pieces under 500g). Avoid drilling — acrylic chips at drill points.
        </p>

        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Storage</h3>
        <p>
          Wrap in soft cloth and store flat or upright in a temperature-stable area (14–28 °C).
          Avoid prolonged direct sunlight — it can yellow some neon and clear finishes over time.
        </p>
      </div>
    </Container>
  );
}
```

- [ ] **Step 6: Verify**

```bash
cd site && npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 7: Commit**

```bash
cd ..
git add site/src/app/about site/src/app/faq site/src/app/shipping site/src/app/contact site/src/app/care
git commit -m "feat(site): static content pages (About, FAQ, Shipping, Contact, Care)"
```

---

## Task 10: SEO infrastructure — sitemap, robots, JSON-LD

**Files:**
- Create: `site/src/app/sitemap.ts`
- Create: `site/src/app/robots.ts`
- Create: `site/src/components/site/StructuredData.tsx`
- Modify: `site/src/app/layout.tsx` (organization JSON-LD)
- Modify: `site/src/app/shop/[slug]/page.tsx` (product JSON-LD)

- [ ] **Step 1: Sitemap**

Path: `site/src/app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next';
import { getAllProducts, getAllCategories } from '@/lib/catalog/queries';

const BASE_URL = process.env.AUTH_URL ?? 'https://acrylixco-production.up.railway.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  const staticPages = ['', '/shop', '/customize', '/about', '/faq', '/shipping', '/contact', '/care'];

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
```

- [ ] **Step 2: Robots**

Path: `site/src/app/robots.ts`

```ts
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
```

- [ ] **Step 3: StructuredData component**

Path: `site/src/components/site/StructuredData.tsx`

```tsx
interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 4: Add Organization JSON-LD to root layout**

Path: `site/src/app/layout.tsx` — inside the `<html>` body, before `<Header />` or in `<head>`. Cleanest is alongside the metadata export — but Next 16 doesn't allow <script> in metadata. Inject it inside the body via the `StructuredData` component.

In the root layout file, import and add inside `<body>` *before* `<Header />`:

```tsx
import { StructuredData } from '@/components/site/StructuredData';
// ...
<StructuredData
  data={{
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AcrylixCo',
    url: 'https://acrylixco-production.up.railway.app',
    description: 'Custom-made multi-layered acrylic pieces for life events. Designed in Sydney.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Sydney',
      addressCountry: 'AU',
    },
  }}
/>
```

- [ ] **Step 5: Add Product JSON-LD on the product detail route**

In `site/src/app/shop/[slug]/page.tsx`, when rendering the product detail block, render a `<StructuredData>` with shape:

```ts
{
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: images.map((i) => i.url),
  offers: {
    '@type': 'Offer',
    priceCurrency: 'AUD',
    price: (product.priceCents / 100).toFixed(2),
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/PreOrder',
  },
}
```

Insert it inside the page's product-rendering branch, right after the `Container` opens.

- [ ] **Step 6: Verify locally**

```bash
cd site && npm run build
npm run dev
```

In a browser:
- http://localhost:3000/sitemap.xml — XML response listing all pages
- http://localhost:3000/robots.txt — text response with allow + sitemap line
- http://localhost:3000/shop/mia-heart-baby — view source, find Product JSON-LD

Stop the server.

- [ ] **Step 7: Commit**

```bash
cd ..
git add site/src/app/sitemap.ts site/src/app/robots.ts site/src/app/layout.tsx site/src/app/shop/[slug]/page.tsx site/src/components/site/StructuredData.tsx
git commit -m "feat(seo): sitemap, robots, Organization + Product JSON-LD"
```

---

## Task 11: E2E tests for storefront

**Files:**
- Create: `site/e2e/shop.spec.ts`
- Create: `site/e2e/content.spec.ts`

- [ ] **Step 1: Shop spec**

Path: `site/e2e/shop.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('shop page lists products', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'The full collection.' })).toBeVisible();
  // Sidebar shows category links.
  await expect(page.getByRole('link', { name: 'All pieces' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Personal milestones' })).toBeVisible();
  // At least one product card link.
  const productLinks = page.locator('a[href^="/shop/"]');
  await expect(productLinks.first()).toBeVisible();
});

test('product detail page renders price + customise CTA', async ({ page }) => {
  await page.goto('/shop/mia-heart-baby');
  await expect(page.getByRole('heading', { level: 1, name: /Mia/ })).toBeVisible();
  await expect(page.getByText('AUD')).toBeVisible();
  await expect(page.getByRole('link', { name: /Customize this design/ })).toBeVisible();
});

test('category page filters products', async ({ page }) => {
  await page.goto('/shop/personal-milestones');
  await expect(page.getByRole('heading', { name: 'Personal milestones' })).toBeVisible();
  const productLinks = page.locator('a[href^="/shop/"]');
  await expect(productLinks.first()).toBeVisible();
});
```

- [ ] **Step 2: Content spec**

Path: `site/e2e/content.spec.ts`

```ts
import { test, expect } from '@playwright/test';

const PAGES: { path: string; expectedHeading: RegExp }[] = [
  { path: '/about', expectedHeading: /Sydney-made acrylic decor/ },
  { path: '/faq', expectedHeading: /Common questions/ },
  { path: '/shipping', expectedHeading: /Shipping & returns/ },
  { path: '/contact', expectedHeading: /Get in touch/ },
  { path: '/care', expectedHeading: /Keeping your piece looking new/ },
];

for (const { path, expectedHeading } of PAGES) {
  test(`${path} renders with the expected heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible();
  });
}

test('sitemap.xml lists product URLs', async ({ page }) => {
  const response = await page.goto('/sitemap.xml');
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  expect(body).toContain('/shop/mia-heart-baby');
  expect(body).toContain('/customize');
});

test('robots.txt allows crawling and references sitemap', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.status()).toBe(200);
  const body = await response?.text();
  expect(body).toMatch(/Sitemap:.*sitemap\.xml/);
});
```

- [ ] **Step 3: Run E2E**

The Playwright `webServer` command does `npm run build && npm run start`. The build needs DATABASE_URL set so the catalog queries can resolve at SSG/render time. Update the Playwright config OR set `DATABASE_URL` in the env.

Pragmatic: in CI / E2E we run with `DATABASE_URL` pointing at the local Postgres (already running per Phase 0 setup). Run:

```bash
cd site
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npm run test:e2e
```

Expected: all specs pass — 1 sanity (updated) + 2 customize (existing) + 3 shop + 6 content/SEO = 12.

- [ ] **Step 4: Commit**

```bash
cd ..
git add site/e2e/
git commit -m "test(e2e): storefront catalog, content pages, sitemap, robots"
```

---

## Task 12: Push, watch CI, seed Railway DB, verify production

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

- [ ] **Step 2: Watch CI**

GitHub Actions runs lint + format + typecheck + unit tests + build + e2e. **Note**: the e2e step needs `DATABASE_URL` in CI. If it isn't already set, the catalog tests and the build will fail. Add `DATABASE_URL` to `.github/workflows/ci.yml` env (a separate Postgres service container or a secret pointing at a Neon dev branch).

If CI fails on missing DATABASE_URL: add a Postgres service to the CI workflow:

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: acrylixco
      POSTGRES_PASSWORD: acrylixco_dev
      POSTGRES_DB: acrylixco
    ports: ['5432:5432']
    options: >-
      --health-cmd "pg_isready -U acrylixco -d acrylixco"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 10
```

Then in the job's env block add `DATABASE_URL: postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco`. Add a step before "Build" to run `npx drizzle-kit migrate` and `npm run db:seed`.

Make the workflow change in a separate commit if needed.

- [ ] **Step 3: Watch Railway deploy**

Railway auto-deploys on push to main. The new migration applies automatically (Dockerfile CMD chains `drizzle-kit migrate`). The new tables exist in production but the seed has not run yet — production will show empty grids.

- [ ] **Step 4: Seed the production database**

Two options:
1. **Railway CLI**: `railway run --service AcrylixCo npm run db:seed` (requires `RAILWAY_TOKEN` locally).
2. **One-off Railway shell**: open the AcrylixCo service shell in Railway → run `npm run db:seed`.

Either way, verify with the production URL.

- [ ] **Step 5: Production smoke test**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/shop
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/shop/mia-heart-baby
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/about
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/sitemap.xml
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://acrylixco-production.up.railway.app/robots.txt
```

Expected: all HTTP 200.

- [ ] **Step 6: Visual verification via Playwright**

Open each route in a Playwright browser session. Verify:
- Home: hero, featured products grid (4 cards), category strip, customise CTA
- Shop: full grid (10 products), category sidebar
- Product detail: image, price in AUD, "Customize this design" CTA
- About / FAQ / Shipping / Contact / Care: render with their copy

- [ ] **Step 7: Update plan README**

Update `Plan/build/README.md` Phase 2 row to "Done — storefront live". Commit + push.

---

## Phase 2 Definition of Done

- [ ] `npm run lint && format:check && typecheck && test && test:e2e && build` succeeds (with `DATABASE_URL` set).
- [ ] `/`, `/shop`, `/shop/[slug]` (product), `/shop/[slug]` (category), `/customize`, `/about`, `/faq`, `/shipping`, `/contact`, `/care` all render in production.
- [ ] `/sitemap.xml` and `/robots.txt` respond.
- [ ] Product detail pages emit `Product` JSON-LD; root layout emits `Organization` JSON-LD.
- [ ] Catalog seeded with at least 10 products and 5 categories on production Postgres.
- [ ] CI green on `main`.
- [ ] `Plan/build/README.md` Phase 2 row updated to "Done".

When this is true, demo it (live URL, walk through home → shop → product → customize) and write Phase 3 (Commerce).

## What Phase 3 will contain

Cart UI (with the `designLineItemMetadataSchema` already defined in Phase 1), checkout, payments (Stripe + PayPal + Afterpay), customer accounts, saved designs, order history, transactional emails. The biggest single phase. Plan to be written after Phase 2 ships.
