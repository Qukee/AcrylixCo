# Phase 2.5 — Storefront Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Phase 2 storefront from a competent generic e-commerce site into a differentiated, conversion-optimised AcrylixCo. Apply the 18 file-mapped patterns extracted from the [market research](../research/2026-05-10-market-research.md) — competitor study of 12 AU acrylic businesses + 6 premium DTC and personalisation references.

**Architecture:** Pure storefront-tier work — no DB schema changes, no new infra. Edits cluster around `site/src/app/page.tsx`, `site/src/app/shop/`, `site/src/components/site/`, plus a few new components. The underlying data model is sufficient; some recommendations expose existing fields that the UI didn't surface.

**Tech Stack:** existing Next.js 16 + Tailwind v4 + Drizzle. No new dependencies for P0–P2; P3 introduces hard-coded "Shop the look" coordinates with no runtime cost.

**Out of scope:** Cart UI (Phase 3), payments (Phase 3), real customer reviews (Phase 2.6 stretch with Judge.me), bundle SKUs (Phase 2.6 stretch), photography reshoot (briefed but not commissioned here).

**Decision points marked for owner review** are flagged with **🟡 DECIDE** before code lands. The plan asks owner approval for:
1. Hero headline copy (2 candidates)
2. Tone direction (literary-restrained vs. founder-warm)
3. Whether to do P3 photography brief now or defer
4. Trust strip wording (3 candidates per cell)

---

## Pre-flight — production DB seed (carry-over from Phase 2)

The Phase 2 production deploy succeeded but the production Postgres is empty. `/shop` shows "No products yet." on production. Before any P0 work lands, seed the prod DB so we can verify end-to-end on real product data.

- [ ] **Step 1: Get DATABASE_PUBLIC_URL from Railway**

In the Railway dashboard, Postgres service → Variables. Either click the eye-icon on `DATABASE_PUBLIC_URL` to reveal, or use the Copy button. Format: `postgresql://postgres:<password>@<proxy>.proxy.rlwy.net:<port>/railway`.

- [ ] **Step 2: Run the seed against prod**

```bash
cd /Users/mohamadhassan/Desktop/AcrylixCo/site
DATABASE_URL="<paste-DATABASE_PUBLIC_URL>" npm run db:seed
```

Expected: "Seeded 5 categories, 10 products."

- [ ] **Step 3: Verify production**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://acrylixco-production.up.railway.app/shop
curl -s https://acrylixco-production.up.railway.app/shop/mia-heart-baby | grep -oE '(Mia|AUD)[^<]{0,40}' | head -3
```

Expected: 200 + product visible. Once verified, mark Phase 2 Task 12 complete and proceed to P0.

---

## P0 — Trust + framing fixes (highest leverage, ~1 day)

These are the changes that, per the research, every successful AU competitor has and we don't.

### Task P0.1: Persistent announcement bar

**Files:**
- Create: `site/src/components/site/Announcement.tsx`
- Modify: `site/src/app/layout.tsx` (mount above Header)

**Why:** Universal AU pattern. ByCarly: *"Spend $220+ online and get FREE shipping"*. Hello Fern: *"$10 FLAT RATE SHIPPING AUSTRALIA WIDE / FREE AU SHIPPING FOR ORDERS OVER $150"*. Letterly: *"10% off your first order"*. AcrylixCo currently has zero of these.

- [ ] **Step 1: Create the component**

Path: `site/src/components/site/Announcement.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Free AU shipping on orders over $150',
  'Designed in Sydney · dispatched in 7–10 days',
  'Afterpay available at checkout',
];

export function Announcement() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, [reduced]);

  if (reduced) {
    return (
      <div className="bg-cream-200 text-ink-700">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-1 px-6 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em]">
          {MESSAGES.map((m) => (
            <span key={m}>· {m}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-cream-200 text-ink-700"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="mx-auto max-w-7xl px-6 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em]">
        {MESSAGES[index]}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Mount it in the root layout**

Edit `site/src/app/layout.tsx`. Import `Announcement` and place it above `<Header />`. Wrap layout body with `<>...</>` if needed.

```tsx
import { Announcement } from '@/components/site/Announcement';
// ...
<body className="flex min-h-screen flex-col">
  <Announcement />
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</body>
```

- [ ] **Step 3: Verify**

```bash
cd site && npm run typecheck && npm run lint && npm run build
```

Visual check via dev server: announcement strip cycles 3 messages, doesn't push content jarringly.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/site/Announcement.tsx site/src/app/layout.tsx
git commit -m "feat(site): persistent announcement bar (shipping, dispatch, Afterpay)"
```

---

### Task P0.2: Hero rewrite — lead with the customizer

**Files:**
- Modify: `site/src/app/page.tsx` (hero section, lines ~18–39)

**Why:** Current copy *"Made-to-order acrylic decor for life's occasions"* mirrors Hello Fern, Hello Acrylic, and Tinyme almost verbatim. Our 3D customizer is the unique asset; the hero must lead with it.

🟡 **DECIDE: Hero headline copy.** Two candidates from the research:

- **(a)** *Acrylic, made for the moments that matter — and made to your name.*
- **(b)** *Your name. Cast in light, layered in colour, made to last.*

Recommendation: **(b)**. More distinctive, more sensory, fits the literary-restrained voice the research recommends. Reads like Cuyana / Aesop, not Etsy. **(a)** is safer and closer to current voice but echoes Hello Acrylic's *"for the moments that matter most"*.

- [ ] **Step 1: Edit the hero section**

Replace the hero `<section>` in `site/src/app/page.tsx` with:

```tsx
<section className="border-b border-cream-300/60">
  <Container className="py-20 md:py-32">
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
      Sydney studio · since 2024
    </p>
    <h1 className="mt-3 max-w-4xl font-serif text-5xl italic leading-[1.05] md:text-7xl">
      Your name. Cast in light, layered in colour, made to last.
    </h1>
    <p className="mt-6 max-w-xl text-ink-700 md:text-lg">
      Design your piece in 3D, see it from every angle, then we&rsquo;ll laser-cut
      and ship it from our Sydney studio in 7–10 days.
    </p>
    <div className="mt-10 flex flex-wrap gap-4">
      <Button href="/customize" size="lg">
        Design yours in 3D
      </Button>
      <Button href="/shop" size="lg" variant="ghost">
        Browse the studio
      </Button>
    </div>
  </Container>
</section>
```

Notes:
- Eyebrow updated: *"Sydney studio · since 2024"* (vs. *"Sydney · since 2024"*) — adds "studio" which aligns with the positioning.
- Subhead **explicitly names the 3D preview** as the differentiating moment.
- Primary CTA is now **/customize**, not /shop.
- Secondary CTA renamed *"Browse the studio"* (not *"Browse the shop"*) — same target, warmer phrasing.

- [ ] **Step 2: Update the existing E2E sanity spec**

Path: `site/e2e/sanity.spec.ts` — change the heading assertion to match the new copy:

```ts
await expect(page.getByRole('heading', { level: 1 })).toContainText(
  /Your name|Cast in light/,
);
```

- [ ] **Step 3: Verify and commit**

```bash
cd site && npm run typecheck && npm run lint && npm run test:e2e
```

```bash
git add site/src/app/page.tsx site/e2e/sanity.spec.ts
git commit -m "feat(site): hero leads with 3D customizer, copy distinctive vs. AU peers"
```

---

### Task P0.3: Trust strip below hero

**Files:**
- Create: `site/src/components/site/TrustStrip.tsx`
- Modify: `site/src/app/page.tsx` (insert after hero)

**Why:** Universal pattern. Hello Acrylic: *"Designed + Etched here in our QLD studio"*. Laser Edge: *"Family-run business based in Melbourne / Trusted by 1,000+ small businesses"*. ByCarly: *"100% Family Owned Small Business / Handmade in Nambour, Sunshine Coast QLD"*. We have nothing.

🟡 **DECIDE: Trust strip cell wording.** Three candidates per cell. Pick one set OR mix and match.

**Cell 1 (origin):**
- (a) *Designed in Sydney · By a small studio team*
- (b) *Sydney studio · Owner-operated*
- (c) *Made in Sydney · Cast acrylic, hand-finished*

**Cell 2 (made-to-order):**
- (a) *Made to order · Each piece laser-cut just for you*
- (b) *Cut to order · Nothing on a shelf*
- (c) *Made-to-order · Your design, our laser*

**Cell 3 (turnaround):**
- (a) *Dispatched in 7–10 days · Rush options available*
- (b) *Ships in 7–10 days · Tracked AU shipping*
- (c) *Built and shipped in 7–10 days*

**Cell 4 (payment):**
- (a) *Afterpay welcome · Pay in four*
- (b) *Pay your way · Card, Apple Pay, Afterpay*
- (c) *Afterpay available · No surprises at checkout*

Recommendation: 1c, 2a, 3a, 4a — each chooses the most concrete, least-marketing-speak option.

- [ ] **Step 1: Create the component**

Path: `site/src/components/site/TrustStrip.tsx`

```tsx
interface TrustCell {
  title: string;
  detail: string;
}

const CELLS: TrustCell[] = [
  { title: 'Made in Sydney', detail: 'Cast acrylic, hand-finished' },
  { title: 'Made to order', detail: 'Each piece laser-cut just for you' },
  { title: 'Dispatched in 7–10 days', detail: 'Rush options available' },
  { title: 'Afterpay welcome', detail: 'Pay in four' },
];

export function TrustStrip() {
  return (
    <section className="border-b border-cream-300/60 bg-cream-50">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {CELLS.map((c) => (
          <li
            key={c.title}
            className="border-r border-cream-300/60 px-6 py-6 last:border-r-0 md:py-8"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              {c.detail}
            </p>
            <p className="mt-2 font-serif text-lg italic text-ink-900">{c.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Insert in homepage**

Edit `site/src/app/page.tsx`. Import `TrustStrip` and place it immediately after the hero `<section>` and before the existing Featured section.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/site/TrustStrip.tsx site/src/app/page.tsx
git commit -m "feat(site): trust strip — origin, made-to-order, turnaround, payment"
```

---

### Task P0.4: "How a piece is made" 3-step section

**Files:**
- Create: `site/src/components/site/HowItWorks.tsx`
- Modify: `site/src/app/page.tsx` (insert after TrustStrip)

**Why:** AcrylixCo's biggest unique advantage is the 3D preview. Today it's invisible until the customer scrolls past Featured products. The Humble Gift Co. and ByCarly both call out their *"digital draft approval"* step explicitly to address made-to-order anxiety; we can do the same and lean on the 3D preview as the proof.

- [ ] **Step 1: Create the component**

Path: `site/src/components/site/HowItWorks.tsx`

```tsx
import { Container } from './Container';
import { Button } from './Button';
import { SectionTitle } from './SectionTitle';

const STEPS = [
  {
    n: '01',
    title: 'Design in 3D',
    body:
      'Pick a shape, type the name, choose your finishes. See it from every angle in real time.',
  },
  {
    n: '02',
    title: 'Confirm and order',
    body:
      'What you preview is what we make. No email proofs, no surprises — your screen is the spec sheet.',
  },
  {
    n: '03',
    title: 'Laser-cut and shipped',
    body:
      'We cut, sand, hand-finish and dispatch from our Sydney studio in 7–10 days. Tracked across Australia.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-cream-300/60">
      <Container className="py-16 md:py-24">
        <SectionTitle
          eyebrow="How it works"
          title="From your screen to your shelf, in three steps."
        />
        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-cream-300/60 bg-cream-300/60 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-cream-50 p-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                Step {s.n}
              </p>
              <h3 className="mt-3 font-serif text-2xl italic">{s.title}</h3>
              <p className="mt-3 text-ink-700">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Button href="/customize" size="lg">
            Start your design
          </Button>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Insert into homepage**

Edit `site/src/app/page.tsx`. Import `HowItWorks` and place it after `<TrustStrip />` and before the Featured products section.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/site/HowItWorks.tsx site/src/app/page.tsx
git commit -m "feat(site): 'How a piece is made' editorial block leans on 3D preview"
```

---

### Task P0.5: Footer rewrite — founder voice + email signup

**Files:**
- Modify: `site/src/components/site/Footer.tsx`

**Why:** The current footer is two lines (*"AcrylixCo · Sydney, Australia"* and a copyright). Hello Acrylic signs *"Love, Selms x"*. The Humble Gift Co. has a *"Donate $2 from every name badge — totalling $16,668"* social-good signal. Letterly opens its email popup with *"10% off your first order"* — that hook lives in the footer too.

🟡 **DECIDE: Founder voice — does the owner want their name in the footer?** Two options:
- **(a) Personal**: *"From [Owner name], Sydney."* Single sentence. Builds personal trust like Hello Acrylic's *"Love, Selms x"*.
- **(b) Studio voice**: *"From the studio, Sydney."* Anonymous-but-warm. Easier to maintain when team grows.

Recommendation: **(b) Studio voice** unless the owner wants a personal brand presence.

- [ ] **Step 1: Replace the Footer component**

Path: `site/src/components/site/Footer.tsx` — replace contents with:

```tsx
import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'All pieces' },
      { href: '/shop/personal-milestones', label: 'Personal milestones' },
      { href: '/shop/public-holidays', label: 'Public holidays' },
      { href: '/shop/religious-holidays', label: 'Religious holidays' },
      { href: '/shop/corporate-gifts', label: 'Corporate gifts' },
    ],
  },
  {
    title: 'Customize',
    links: [
      { href: '/customize', label: 'Design your own' },
      { href: '/faq', label: 'How customization works' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/care', label: 'Care instructions' },
      { href: '/shipping', label: 'Shipping & returns' },
      { href: '/contact', label: 'Contact' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-300/60 bg-cream-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-serif text-base italic text-ink-900 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              Stay in touch
            </h3>
            <p className="mt-4 font-serif text-base italic text-ink-700">
              10% off your first piece, plus first dibs on new colours.
            </p>
            <form className="mt-4 flex" action="/api/newsletter/subscribe" method="post">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className="w-full rounded-l-md border border-cream-400 bg-cream-100 px-4 py-2 text-sm text-ink-900 placeholder:text-ink-500"
              />
              <button
                type="submit"
                className="rounded-r-md border border-l-0 border-ink-900 bg-ink-900 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-cream-50 hover:bg-ink-700"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-ink-500">
              We&rsquo;ll send no more than once a week.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-cream-300/60 pt-8">
          <p className="font-serif text-lg italic text-ink-700">
            From the studio, Sydney. Every piece is made to order, by hand, in
            our Inner West workshop.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 md:flex-row md:items-center md:justify-between">
          <p>AcrylixCo · ABN coming soon · © {new Date().getFullYear()}</p>
          <ul className="flex gap-4">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Amex</li>
            <li>Apple Pay</li>
            <li>Afterpay</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

Note: the form `action="/api/newsletter/subscribe"` does **not** yet have a backing route. The form will 404 on submit. Either (a) add the route now (quick — see below) OR (b) ship without it and fix when the popup in P2.1 needs the same endpoint.

- [ ] **Step 2: (Recommended) Add the newsletter API route as a stub**

Path: `site/src/app/api/newsletter/subscribe/route.ts`

```ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = String(formData.get('email') ?? '').trim();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  // TODO: persist + send to Resend / Klaviyo when integrated. For now, log
  // and acknowledge — Phase 2.6 wires real fulfilment.
  console.log('newsletter subscribe:', email);
  return NextResponse.redirect(new URL('/?subscribed=1', req.url), 303);
}
```

This stub accepts the form, logs the email, and redirects back to `/?subscribed=1`. Phase 2.6 swaps in real fulfilment. The form on the page can stay HTML-only (no JS) which is simpler.

- [ ] **Step 3: Verify and commit**

```bash
cd site && npm run typecheck && npm run lint && npm run build
```

```bash
git add site/src/components/site/Footer.tsx site/src/app/api/newsletter
git commit -m "feat(site): footer with link columns, email signup, studio voice"
```

---

## P1 — Catalog + product page (~1 day)

### Task P1.1: Dual-axis homepage taxonomy

**Files:**
- Modify: `site/src/lib/catalog/queries.ts` (add helpers)
- Modify: `site/src/app/page.tsx` (replace category strip)
- Modify: `site/src/db/schema/catalog.ts` (add a `kind` column to `categories`)
- Migration: generated by drizzle-kit
- Modify: `site/src/db/seed/catalog.ts` (set `kind` for each category and add product-type categories)

**Why:** Tinyme, The Humble Gift Co., Hello Acrylic, Mostly A Mum, Blond + Noir all run a dual-axis taxonomy: shop by recipient AND shop by product type. The current "By the moment you're celebrating" framing is too narrow — it forces every product into one occasion bucket.

This task is bigger than P0 because it requires a schema change + seed update.

- [ ] **Step 1: Add `kind` column to categories**

Path: `site/src/db/schema/catalog.ts` — change the `categories` table to:

```ts
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  /** 'occasion' (current) or 'product_type'. Default 'occasion' for back-compat. */
  kind: text('kind', { enum: ['occasion', 'product_type'] })
    .notNull()
    .default('occasion'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

Generate + apply migration:

```bash
cd site
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npx drizzle-kit generate
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npx drizzle-kit migrate
```

- [ ] **Step 2: Update the seed**

Edit `site/src/db/seed/catalog.ts`. Add product-type categories alongside the existing occasion categories:

```ts
const SEED_CATEGORIES = [
  // Occasions (existing — set kind explicitly).
  { id: 'cat-personal', slug: 'personal-milestones', name: 'Personal milestones', kind: 'occasion', sortOrder: 1 },
  { id: 'cat-public', slug: 'public-holidays', name: 'Public holidays', kind: 'occasion', sortOrder: 2 },
  { id: 'cat-religious', slug: 'religious-holidays', name: 'Religious holidays', kind: 'occasion', sortOrder: 3 },
  { id: 'cat-corporate', slug: 'corporate-gifts', name: 'Corporate gifts', kind: 'occasion', sortOrder: 4 },
  { id: 'cat-home', slug: 'home-decor', name: 'Home decor', kind: 'occasion', sortOrder: 5 },
  // Product types (new).
  { id: 'type-name-plaque', slug: 'name-plaques', name: 'Name plaques', kind: 'product_type', sortOrder: 10 },
  { id: 'type-cake-topper', slug: 'cake-toppers', name: 'Cake toppers', kind: 'product_type', sortOrder: 11 },
  { id: 'type-mirror', slug: 'mirrors', name: 'Mirrors', kind: 'product_type', sortOrder: 12 },
  { id: 'type-door-sign', slug: 'door-signs', name: 'Door signs', kind: 'product_type', sortOrder: 13 },
  { id: 'type-ornament', slug: 'ornaments', name: 'Ornaments', kind: 'product_type', sortOrder: 14 },
];
```

Then update each `SEED_PRODUCTS` entry's `categoryIds` to include both an occasion AND a product type. For example:

```ts
{
  id: 'prod-aisha-first-eid',
  // ...
  categoryIds: ['cat-religious', 'cat-personal', 'type-name-plaque'],
},
```

Apply the seed:

```bash
DATABASE_URL="postgresql://acrylixco:acrylixco_dev@localhost:5432/acrylixco" npm run db:seed
```

- [ ] **Step 3: Add typed query helpers**

Path: `site/src/lib/catalog/queries.ts` — add two functions:

```ts
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
```

(`getAllCategories` continues to return all categories regardless of kind.)

- [ ] **Step 4: Replace the homepage category strip**

Edit `site/src/app/page.tsx`. Replace the single existing "Browse by occasion" section with two sections:

```tsx
const [featured, occasions, productTypes] = await Promise.all([
  getFeaturedProducts(4),
  getOccasionCategories(),
  getProductTypeCategories(),
]);

// ...

<section>
  <Container className="py-16 md:py-24">
    <SectionTitle eyebrow="Browse" title="By the piece you&rsquo;re looking for." />
    <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {productTypes.map((c) => (
        <li key={c.id}>
          <Link
            href={`/shop/${c.slug}`}
            className="block rounded-md border border-cream-300/60 bg-cream-100 p-6 transition-colors hover:border-cream-400 hover:bg-cream-50"
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
              Product
            </p>
            <h3 className="mt-2 font-serif text-xl italic">{c.name}</h3>
          </Link>
        </li>
      ))}
    </ul>
  </Container>
</section>

<section className="border-y border-cream-300/60 bg-cream-50">
  <Container className="py-16 md:py-24">
    <SectionTitle eyebrow="Browse" title="By who you&rsquo;re celebrating." />
    <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {occasions.map((c) => (
        <li key={c.id}>
          <Link
            href={`/shop/${c.slug}`}
            className="block rounded-md border border-cream-300/60 bg-cream-50 p-6 transition-colors hover:border-cream-400"
          >
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
              Occasion
            </p>
            <h3 className="mt-2 font-serif text-xl italic">{c.name}</h3>
          </Link>
        </li>
      ))}
    </ul>
  </Container>
</section>
```

- [ ] **Step 5: Verify and commit**

```bash
cd site && DATABASE_URL=... npm run typecheck && npm run test:e2e
```

```bash
git add site/src/db site/src/lib/catalog/queries.ts site/src/app/page.tsx
git commit -m "feat(catalog): dual-axis taxonomy (by piece + by occasion)"
```

Apply the new seed to production via the same `DATABASE_PUBLIC_URL` flow as the pre-flight task.

---

### Task P1.2: Layer-tier + price-range filters on /shop

**Files:**
- Modify: `site/src/app/shop/page.tsx`
- Modify: `site/src/app/shop/CategorySidebar.tsx`
- Modify: `site/src/lib/catalog/queries.ts` (extend filter signature)

**Why:** Hello Acrylic sub-categorises Babies & Kids by *Triple/Double/Single Layer* — telegraphs price tier without numbers. The Humble Gift Co. has *Under $25 / $50 / $100 / $100+* price filter. Both are conversion-optimised browsing aids.

- [ ] **Step 1: Extend `getAllProducts` to accept filters**

Path: `site/src/lib/catalog/queries.ts`

```ts
export interface ProductFilters {
  /** Number of acrylic layers — 1, 2, 3, or 'mixed'. */
  layerCount?: 1 | 2 | 3 | 'mixed';
  /** Inclusive price range in cents. */
  priceMinCents?: number;
  priceMaxCents?: number;
}

export async function getAllProducts(filters: ProductFilters = {}): Promise<ProductSummary[]> {
  const where = [];
  if (filters.priceMinCents !== undefined) {
    where.push(gte(products.priceCents, filters.priceMinCents));
  }
  if (filters.priceMaxCents !== undefined) {
    where.push(lte(products.priceCents, filters.priceMaxCents));
  }
  // Layer count is denormalised into materialsSummary; for this phase we
  // text-match. Phase 4 (admin) introduces a structured `layerCount` column.
  if (filters.layerCount !== undefined) {
    const term =
      filters.layerCount === 'mixed' ? 'mixed' : `${filters.layerCount} layer`;
    where.push(ilike(products.materialsSummary, `%${term}%`));
  }
  const rows = await db
    .select()
    .from(products)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(products.createdAt));
  return Promise.all(rows.map(buildSummary));
}
```

Imports: add `gte, lte, ilike` from `drizzle-orm`.

- [ ] **Step 2: Update /shop page to read query params**

Edit `site/src/app/shop/page.tsx`:

```tsx
interface ShopPageProps {
  searchParams: Promise<{ layers?: string; price?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sp = await searchParams;
  const filters: ProductFilters = {};
  if (sp.layers === '1' || sp.layers === '2' || sp.layers === '3') {
    filters.layerCount = Number(sp.layers) as 1 | 2 | 3;
  } else if (sp.layers === 'mixed') {
    filters.layerCount = 'mixed';
  }
  if (sp.price === 'under-50') filters.priceMaxCents = 5000;
  else if (sp.price === '50-100') {
    filters.priceMinCents = 5000;
    filters.priceMaxCents = 10000;
  } else if (sp.price === '100-200') {
    filters.priceMinCents = 10000;
    filters.priceMaxCents = 20000;
  } else if (sp.price === '200-plus') {
    filters.priceMinCents = 20000;
  }
  const [products, categories] = await Promise.all([
    getAllProducts(filters),
    getAllCategories(),
  ]);
  // ...rest unchanged, sidebar gets filters prop
}
```

- [ ] **Step 3: Add filter UI to the sidebar**

Edit `site/src/app/shop/CategorySidebar.tsx` — add two new sections below the existing category list. Use plain `<a href>` with query strings to keep it server-driven (no client state). Mark active filter via comparing the current URL.

Detail in the implementation pass — the structure mirrors the existing category section.

- [ ] **Step 4: Commit**

```bash
git add site/src/lib/catalog/queries.ts site/src/app/shop/
git commit -m "feat(shop): layer-tier + price-range filters"
```

---

### Task P1.3: PDP — materials block + structured turnaround callout

**Files:**
- Modify: `site/src/app/shop/[slug]/page.tsx`

**Why:** The Humble Gift Co. PDP shows *"3 solid acrylic colours / 2 acrylic + 1 mirror acrylic layer / 2 acrylic + 1 pine wooden layer"*. Letterly: *"made from layered 3mm acrylic"*. Material specificity is a trust signal; the current single-line *"Made to order · ships from Sydney in 7–10 days"* is too easy to skim.

- [ ] **Step 1: Add structured callout after the description**

In the product-rendering branch of `site/src/app/shop/[slug]/page.tsx`, replace the single line *"Made to order · ships from Sydney in 7–10 days"* with a four-cell icon row. Each cell has an inline SVG or unicode glyph plus a label:

```tsx
<dl className="mt-8 grid grid-cols-2 gap-4 border-y border-cream-300/60 py-6 md:grid-cols-4">
  <div>
    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
      Made to order
    </dt>
    <dd className="mt-1 font-serif text-base italic text-ink-900">For you, not from a shelf</dd>
  </div>
  <div>
    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
      Dispatch
    </dt>
    <dd className="mt-1 font-serif text-base italic text-ink-900">7–10 days</dd>
  </div>
  <div>
    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
      Shipping
    </dt>
    <dd className="mt-1 font-serif text-base italic text-ink-900">Tracked AU-wide</dd>
  </div>
  <div>
    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
      Rush option
    </dt>
    <dd className="mt-1 font-serif text-base italic text-ink-900">+$30, 3–5 days</dd>
  </div>
</dl>
```

- [ ] **Step 2: Add a Materials & dimensions expandable**

Below the price/CTA block, add an expandable `<details>`:

```tsx
<details className="mt-8 border-t border-cream-300/60 pt-6">
  <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.18em] text-ink-700 hover:text-ink-900">
    Materials &amp; dimensions
  </summary>
  <dl className="mt-4 space-y-3 text-sm text-ink-700">
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">Materials</dt>
      <dd className="font-serif italic text-ink-900">{product.materialsSummary}</dd>
    </div>
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">Approx. width</dt>
      <dd className="font-serif italic text-ink-900">{product.widthCm} cm</dd>
    </div>
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">Hardware</dt>
      <dd className="font-serif italic text-ink-900">Tabletop stand included</dd>
    </div>
  </dl>
</details>
```

- [ ] **Step 3: Commit**

```bash
git add site/src/app/shop/[slug]/page.tsx
git commit -m "feat(shop): PDP materials block + structured turnaround callout"
```

---

### Task P1.4: PDP — "Pairs well with" cross-sell

**Files:**
- Modify: `site/src/lib/catalog/queries.ts` (add `getRelatedProducts`)
- Modify: `site/src/app/shop/[slug]/page.tsx`

**Why:** The Humble Gift Co. has *"Pairs well with"* and *"You may also like"* cross-sell rows. The current PDP has zero cross-sells — every product detail page is a dead end.

- [ ] **Step 1: Add the query helper**

Path: `site/src/lib/catalog/queries.ts`

```ts
export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  // Find categories of the current product, then any other product in those
  // categories.
  const catRows = await db
    .select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId));
  const categoryIds = catRows.map((c) => c.categoryId);
  if (categoryIds.length === 0) return [];

  const otherProductRows = await db
    .selectDistinct({ productId: productCategories.productId })
    .from(productCategories)
    .where(
      and(
        inArray(productCategories.categoryId, categoryIds),
        ne(productCategories.productId, productId),
      ),
    )
    .limit(limit * 2);
  const productIds = otherProductRows.map((r) => r.productId).slice(0, limit);
  if (productIds.length === 0) return [];

  const rows = await db.select().from(products).where(inArray(products.id, productIds));
  return Promise.all(rows.map(buildSummary));
}
```

Add `ne` to imports.

- [ ] **Step 2: Render at the bottom of the product detail**

In the product-rendering branch:

```tsx
{/* below the materials expandable, after closing the grid */}
<section className="mt-20 border-t border-cream-300/60 pt-12">
  <SectionTitle eyebrow="Pairs well with" title="Other pieces from the studio." />
  <div className="mt-10">
    <ProductGrid products={related} />
  </div>
</section>
```

Where `related` is fetched alongside the product:

```ts
const related = await getRelatedProducts(result.product.id, 4);
```

- [ ] **Step 3: Commit**

```bash
git add site/src/lib/catalog/queries.ts site/src/app/shop/[slug]/page.tsx
git commit -m "feat(shop): PDP 'Pairs well with' cross-sell row"
```

---

## P2 — Conversion mechanics (~half-day)

### Task P2.1: First-time-buyer email popup

**Files:**
- Create: `site/src/components/site/FirstVisitPopup.tsx`
- Modify: `site/src/app/layout.tsx` (mount)

**Why:** Tinyme: *"GET 10% OFF SITEWIDE!"* with code *CLAIM10*. Letterly: *"10% off your first order"*. Universal AU pattern. We have nothing.

The popup is client-only with a 30-day cookie suppression. Posts to `/api/newsletter/subscribe` (the stub from P0.5).

- [ ] **Step 1: Create the component**

Path: `site/src/components/site/FirstVisitPopup.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'acx_popup_v1';
const SUPPRESS_DAYS = 30;

function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${name}=`));
}

function setCookie(name: string, days: number) {
  const expiry = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=1; path=/; expires=${expiry}; SameSite=Lax`;
}

export function FirstVisitPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (hasCookie(COOKIE_NAME)) return;
    const timer = setTimeout(() => setOpen(true), 25_000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setCookie(COOKIE_NAME, SUPPRESS_DAYS);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-heading"
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 px-4"
    >
      <div className="relative w-full max-w-md rounded-md border border-cream-400 bg-cream-50 p-8 shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-4 top-4 font-mono text-xs text-ink-500 hover:text-ink-900"
        >
          ✕
        </button>
        {!submitted ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              First-visit offer
            </p>
            <h2 id="popup-heading" className="mt-3 font-serif text-3xl italic">
              10% off your first piece.
            </h2>
            <p className="mt-3 text-ink-700">
              Plus first dibs on new colours and limited drops. We won&rsquo;t
              email more than once a week.
            </p>
            <form
              className="mt-6 flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                await fetch('/api/newsletter/subscribe', {
                  method: 'POST',
                  body: data,
                });
                setCookie(COOKIE_NAME, SUPPRESS_DAYS);
                setSubmitted(true);
              }}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                aria-label="Email address"
                className="rounded-md border border-cream-400 bg-cream-100 px-4 py-3 text-base text-ink-900 placeholder:text-ink-500"
              />
              <button
                type="submit"
                className="rounded-md bg-ink-900 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-cream-50 hover:bg-ink-700"
              >
                Get my code
              </button>
            </form>
            <button
              type="button"
              onClick={dismiss}
              className="mt-4 w-full text-center font-mono text-xs uppercase tracking-[0.14em] text-ink-500 hover:text-ink-900"
            >
              No thanks
            </button>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              Code on its way
            </p>
            <h2 className="mt-3 font-serif text-2xl italic">
              Check your inbox in a few minutes.
            </h2>
            <p className="mt-3 text-ink-700">
              Use the code at checkout for 10% off. Valid on your first order.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-md bg-ink-900 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-cream-50"
            >
              Keep browsing
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount in root layout**

Path: `site/src/app/layout.tsx` — add `<FirstVisitPopup />` inside `<body>` after the page content (before closing `</body>`). Import:

```tsx
import { FirstVisitPopup } from '@/components/site/FirstVisitPopup';
```

- [ ] **Step 3: Commit**

```bash
git add site/src/components/site/FirstVisitPopup.tsx site/src/app/layout.tsx
git commit -m "feat(site): first-visit 10% off email popup with 30-day cookie"
```

---

### Task P2.2: Customizer step-numbered wizard

**Files:**
- Modify: `site/src/app/customize/Designer.tsx` and/or `DesignerForPiece.tsx`
- Create: `site/src/components/site/StepIndicator.tsx`

**Why:** Tinyme labels its customizer *"STEP 1 Personalize & Preview"*. Today our customizer is one screen with a panel of accordions — a step indicator clarifies progress without restructuring the underlying interaction.

- [ ] **Step 1: Create StepIndicator**

Path: `site/src/components/site/StepIndicator.tsx`

```tsx
interface Step {
  n: string;
  label: string;
}

const STEPS: Step[] = [
  { n: '01', label: 'Pick your shape' },
  { n: '02', label: 'Type your name' },
  { n: '03', label: 'Choose finishes' },
  { n: '04', label: 'Preview & order' },
];

export function StepIndicator() {
  return (
    <ol className="flex items-center justify-center gap-3 overflow-x-auto px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
      {STEPS.map((s, i) => (
        <li key={s.n} className="flex shrink-0 items-center gap-2">
          <span className="text-ink-700">{s.n}</span>
          <span>{s.label}</span>
          {i < STEPS.length - 1 && <span aria-hidden>·</span>}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Render above the designer**

Edit `site/src/app/customize/Designer.tsx` — wrap the existing return in a flex column and put `<StepIndicator />` at the top.

```tsx
<div className="designer-root flex h-full flex-col">
  <StepIndicator />
  <div className="flex-1 relative">
    <Scene .../>
    <ControlPanel .../>
    {/* loading and error overlays */}
  </div>
</div>
```

The customizer behaviour is unchanged — only the visual cue is added.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/site/StepIndicator.tsx site/src/app/customize/
git commit -m "feat(designer): step-numbered indicator above customizer"
```

---

## P3 — Brand voice + visual polish (~1 day)

### Task P3.1: Tone audit — global copy pass

**Files:**
- Modify: `site/src/app/page.tsx`
- Modify: `site/src/app/shop/page.tsx`
- Modify: `site/src/app/shop/[slug]/page.tsx`
- Modify: `site/src/components/site/SectionTitle.tsx` (potentially)

**Why:** The research found our existing italic-serif voice is correct directionally — *don't* lift Hello Acrylic's emoji-heavy register. The hero rewrite (P0.2) commits to the literary-restrained tone; this task aligns the rest of the site.

🟡 **DECIDE: Tone direction.** Two options:
- **(a) Restrained-literary** (Cuyana / Aesop / Minted register — what the research recommends): *"Pieces our studio is making this week."* / *"Our full studio shelf."* / *"Studio / Shop / [category]"* breadcrumb.
- **(b) Warm-personal** (Hello Acrylic's softer register): *"Made with care this week."* / *"What's on our shelf right now."* / *"Shop / [category]"* breadcrumb (no studio prefix).

Recommendation: **(a)**. Reinforces the studio-tier positioning that justifies the higher AOV.

Specific changes (assuming (a)):

- [ ] **Step 1: Home — Featured section title**

In `site/src/app/page.tsx`, change the Featured `SectionTitle` from:
- `title="Made for moments worth keeping."` 
- `description="Our most-requested pieces, ready to ship or be made-to-order in your colours."`

To:
- `title="Pieces our studio is making this week."`
- `description="A live look at the templates we're laser-cutting right now. Buy as-is, or open the designer and make it yours."`

- [ ] **Step 2: /shop title**

In `site/src/app/shop/page.tsx`, change `SectionTitle`:
- `title="The full collection."` → `title="Our full studio shelf."`

- [ ] **Step 3: PDP breadcrumb**

In `site/src/app/shop/[slug]/page.tsx`, change the breadcrumb opening from `<Link href="/shop">Shop</Link>` to a two-segment breadcrumb: *Studio / Shop / [category]*. Implementation:

```tsx
<p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
  <Link href="/" className="hover:text-ink-900">Studio</Link>
  {' / '}
  <Link href="/shop" className="hover:text-ink-900">Shop</Link>
  {categories[0] && (
    <>
      {' / '}
      <Link href={`/shop/${categories[0].slug}`} className="hover:text-ink-900">
        {categories[0].name}
      </Link>
    </>
  )}
</p>
```

- [ ] **Step 4: Commit**

```bash
git add site/src/app/page.tsx site/src/app/shop/
git commit -m "chore(site): tone pass — studio-tier voice across home, shop, PDP"
```

---

### Task P3.2: Header refinement

**Files:**
- Modify: `site/src/components/site/Header.tsx`

**Why:** The current Header has 3 nav items (Shop, Customize, About). Add high-volume entry points (Cake toppers, Wedding) and elevate the Customize CTA.

- [ ] **Step 1: Replace the Header**

Path: `site/src/components/site/Header.tsx` — update the nav section:

```tsx
<nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-700">
  <Link href="/shop" className="hover:text-ink-900">Shop</Link>
  <Link href="/shop/cake-toppers" className="hover:text-ink-900">Cake toppers</Link>
  <Link href="/shop/personal-milestones" className="hover:text-ink-900">Wedding & baby</Link>
  <Link href="/about" className="hover:text-ink-900">Studio</Link>
  <Link
    href="/customize"
    className="rounded-full border border-cream-400 px-4 py-1.5 text-ink-900 transition-colors hover:bg-cream-50"
  >
    Customize
  </Link>
</nav>
```

The Customize link now reads as a pill (visually elevated) without using the full Button component. The "Wedding & baby" link points at the existing personal-milestones category — Phase 2.6 can split it if needed.

- [ ] **Step 2: Commit**

```bash
git add site/src/components/site/Header.tsx
git commit -m "feat(site): header — add high-volume categories, elevate Customize"
```

---

### Task P3.3: "Shop the look" editorial block (placeholder)

**Files:**
- Create: `site/src/components/site/ShopTheLook.tsx`
- Modify: `site/src/app/page.tsx`

**Why:** Letterly's *"Shop the look"* CTA opens a styled nursery photo with hot-spotted products. Lulu & Georgia leans heavily on editorial photography. Our biggest brand-differentiation move alongside the customizer.

Phase 2.5 ships a **placeholder version** that demonstrates the layout. Phase 2.6 commissions real photography.

🟡 **DECIDE: Defer or ship placeholder?** Two options:
- **(a) Ship placeholder now** with a procedurally-generated SVG illustration of a styled tablescape with three pieces hot-spotted. Pattern lands; visuals look provisional.
- **(b) Defer until photography lands** in Phase 2.6.

Recommendation: **(a) ship placeholder**. The layout is the point — engineering ships, photography is later. Owner sees the structure now and can sign off on the visual direction before the camera comes out.

If (a):

- [ ] **Step 1: Create the component**

Path: `site/src/components/site/ShopTheLook.tsx`

```tsx
import Link from 'next/link';
import { Container } from './Container';
import { SectionTitle } from './SectionTitle';

interface Hotspot {
  /** Percent positioning. */
  x: number;
  y: number;
  productSlug: string;
  productName: string;
  priceLabel: string;
}

const HOTSPOTS: Hotspot[] = [
  { x: 25, y: 40, productSlug: 'mj-wedding-monogram', productName: '"M & J" Wedding Monogram', priceLabel: '$138' },
  { x: 60, y: 55, productSlug: 'aisha-first-eid-plaque', productName: '"Aisha\'s First Eid"', priceLabel: '$85' },
  { x: 80, y: 30, productSlug: 'olivia-circular-frame', productName: '"Olivia" Frame', priceLabel: '$72' },
];

export function ShopTheLook() {
  return (
    <section className="border-y border-cream-300/60">
      <Container className="py-16 md:py-24">
        <SectionTitle eyebrow="Shop the look" title="Pieces, in the rooms they live in." />
        <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-md bg-cream-200">
          {/* Placeholder gradient illustration. Real photography in Phase 2.6. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #f3ede0 0%, #ece5d3 40%, #dcd3bd 100%)',
            }}
          />
          <p className="absolute left-6 top-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            Editorial — coming soon
          </p>
          {HOTSPOTS.map((h) => (
            <Link
              key={h.productSlug}
              href={`/shop/${h.productSlug}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span className="relative grid h-7 w-7 place-items-center rounded-full bg-cream-50 shadow-md ring-1 ring-cream-400 transition-transform group-hover:scale-110">
                <span className="block h-2 w-2 rounded-full bg-ink-900" />
              </span>
              <span className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 rounded-md bg-cream-50 px-3 py-2 text-xs shadow-md ring-1 ring-cream-400 group-hover:block">
                <span className="font-serif italic text-ink-900">{h.productName}</span>
                <br />
                <span className="font-mono uppercase tracking-wide text-ink-500">{h.priceLabel}</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Insert in homepage**

After the Featured products section, before the Customize CTA section.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/site/ShopTheLook.tsx site/src/app/page.tsx
git commit -m "feat(site): 'Shop the look' editorial block (placeholder, Phase 2.6 reshoot)"
```

---

## Stretch (Phase 2.6, not part of this plan)

Saved for after P0–P3 ships and we see real customer behaviour:

- **P2.6.1 Wedding day set bundle** — `/shop/sets/wedding` with welcome sign + table number stack + cake topper at 10% off bundle.
- **P2.6.2 Mini-tier $29 SKU** — entry-level "Mini name plaque" template at $29.
- **P2.6.3 Judge.me reviews** — install once 20+ orders ship.
- **P2.6.4 Instagram embed** — `@acrylixco` feed below Featured until reviews exist.
- **P2.6.5 Real photography reshoot** — flatlay studio cream + propped lifestyle (per the photography brief in §P3.1 of research).
- **P2.6.6 Pre-load customizer with product context** — `/customize?template=mia-heart-baby` deep-links from PDP.

---

## Phase 2.5 Definition of Done

- [ ] Production DB seeded; `/shop` shows real products (pre-flight task).
- [ ] All P0 tasks shipped (announcement, hero, trust strip, "How it works", footer).
- [ ] All P1 tasks shipped (dual-axis taxonomy, filters, materials block, cross-sell).
- [ ] All P2 tasks shipped (popup, customizer step indicator).
- [ ] All P3 tasks shipped (tone pass, header, Shop the look placeholder).
- [ ] CI green on `main`.
- [ ] Production smoke-test: every modified route returns 200 + new copy.
- [ ] Owner signs off on the live URL.
- [ ] `Plan/build/README.md` Phase 2.5 row updated to "Done".

---

## What Phase 3 will contain (for context)

Cart UI (using the `designLineItemMetadataSchema` from Phase 1), checkout, payments (Stripe + PayPal + Afterpay), customer accounts, saved designs, order history, transactional emails (order confirmation + design proof + shipping). The biggest single phase. Plan written after Phase 2.5 ships and we have a real customer flow to converge against.
