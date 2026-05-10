# SEO, Analytics & Content

Discoverability and the standard editorial pages every e-commerce site needs.

## SEO

- Per-page **meta tags** (title, description, og:image, og:title, og:description, twitter card).
- **Sitemap** — auto-generated, includes all catalog products and category pages.
- **Robots.txt** — allow crawling of public pages, disallow `/admin/*` and customer account routes.
- **Structured data** (schema.org JSON-LD):
  - `Product` for each catalog item
  - `Organization` for site-wide
  - `BreadcrumbList` on category and product pages
  - `Review` / `AggregateRating` where applicable
- **Fast page loads** — Core Web Vitals target: green for LCP, INP, CLS.
- **Friendly URLs** — `/products/<category>/<slug>` rather than ID-based.
- **Canonical URLs** — handle filtered category pages (avoid duplicate content via `rel="canonical"`).

## Analytics

- **Google Analytics 4** — page views, e-commerce events, custom events for designer interactions (template chosen, design saved, design shared, custom add-to-cart).
- Respect customer consent — Australian Privacy Principles compliance. Use a consent banner where required.

## Standard content pages

These are static-ish editorial pages, editable from the [admin dashboard](./17-admin-dashboard.md):

- **About** — story of AcrylixCo, photos, owner bio.
- **FAQ** — common questions (turnaround time, materials, shipping, custom designs, refunds).
- **Shipping & Returns** — Australia Post info, turnaround estimates, return policy for custom vs standard items.
- **Contact** — contact form + email, optional phone, address (or service area), social links.
- **Care Instructions** — how to keep an acrylic piece looking new, mounting tips.

## Performance

Performance is also an SEO concern — see [constraints](./23-constraints-and-quality.md) for hard targets. Image optimization, code splitting, and lazy-loading the 3D engine are all part of hitting Core Web Vitals.

## Open questions

- **Blog / journal** for SEO content (occasion-themed pieces, gift guides) — out of scope for v1 unless desired.
- Multi-language SEO — English-only at v1.
- Should we publish a **public design gallery** of recent customer creations (with consent) for SEO + social proof?

## Related

- [Product catalog](./03-product-catalog.md) — product structured data
- [Admin dashboard](./17-admin-dashboard.md) — content page editing
- [Constraints & quality bar](./23-constraints-and-quality.md) — performance targets
- [Accessibility](./20-accessibility.md) — overlap with SEO best practices
