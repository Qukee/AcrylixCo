# Implementation Phases

The build order. The principle: **build the custom designer first** because it's the highest-risk, highest-value feature. A working designer with a fake checkout is more valuable to validate early than a polished checkout with a broken designer.

## Phase 0 — Foundations

- Repo setup, TypeScript, lint, format, CI.
- Next.js scaffolding with App Router.
- Postgres + ORM (Drizzle preferred; see [tech stack](./21-tech-stack.md)).
- Auth scaffolding (customer + admin roles).
- Deploy preview environment.

## Phase 1 — The geometric heart of the designer

The riskiest unknowns first.

1. **[Layer system](./06-layer-system.md)** as a typed data model.
2. **[Offset-outline generation](./07-offset-outline-generation.md)** — prototype with at least two libraries (Paper.js, Clipper) and validate against script-font test cases.
3. **2D canvas** rendering layers with live offset updates.
4. **Border thickness slider** wired to live geometry.

Exit criteria: type any name in any of 5+ fonts, slide border thickness, see the base update in real time without artifacts. **Do this before building anything else.**

## Phase 2 — The rest of the designer

5. **[Composition templates](./05-composition-templates.md)** — load templates from data; designer starts with a template, not a blank canvas.
6. **[Material & finish library](./08-material-finish-library.md)** in 2D (flat color preview).
7. **[Typography](./09-typography.md)** — full font library, multi-script.
8. **[Decorative elements](./10-decorative-elements.md)** library.
9. **[Dimensioning & live pricing](./12-dimensioning-and-pricing.md)** — sizes, price recalc.
10. **[3D preview](./11-3d-preview.md)** — Three.js + R3F, accurate finish rendering.
11. **[Mobile experience](./14-mobile-experience.md)** — responsive layout, performance pass.

## Phase 3 — Persistence & cart

12. **[Save / share / cart](./13-design-persistence-and-handoff.md)** — design serialization, shareable URLs, cart attachment with thumbnails.
13. **Fake checkout** (no real payments yet) — to validate the full design-to-cart flow end-to-end.

## Phase 4 — Storefront

14. **[Standard product catalog](./03-product-catalog.md)** — categories, filters, search, product detail, reviews, wishlist.
15. **[SEO & content pages](./19-seo-and-content.md)** — meta tags, sitemap, structured data, About / FAQ / Shipping / Contact / Care.

## Phase 5 — Commerce

16. **[Payments & checkout](./15-payments-and-checkout.md)** — Stripe, PayPal, Afterpay; Australia Post shipping; GST + tax invoicing.
17. **[Customer accounts](./16-customer-accounts.md)** — order history, saved designs, addresses, wishlists.
18. **[Emails & notifications](./18-emails-and-notifications.md)** — order confirmation, shipping, proof approval, abandoned cart, back-in-stock.

## Phase 6 — Operations

19. **[Admin dashboard](./17-admin-dashboard.md)** — products, orders, inventory, templates, fonts, finishes, decorative assets, discount codes, content pages.
20. **Production-file generation** — per-layer SVG/PDF for the laser cutter, downloadable from the admin order viewer.

## Phase 7 — Quality & launch

21. **[Accessibility](./20-accessibility.md)** pass — WCAG 2.1 AA across catalog, designer, checkout.
22. **Performance pass** — Core Web Vitals, mobile 3D fps, real-device testing on mid-range Android.
23. **Production readiness** — hosting, payment account verification, domain, monitoring, error tracking.
24. **Soft launch** — limited audience, real orders, validate the manufacturing handoff.
25. **Public launch.**

## Deliverables (per the original spec)

1. Clarifying questions before any code.
2. Recommended [tech stack](./21-tech-stack.md) with rationale.
3. Project structure and data model.
4. Phased implementation as above.
5. Working code runnable locally with setup instructions.
6. Production-readiness notes (hosting, payment account setup, domain, launch checklist).

## Why this order

- The designer is the highest **technical risk** and the highest **product risk** — if it can't be made to work well, the whole proposition collapses. Validate it first with a fake checkout.
- The standard catalog is **conventional** and lower-risk — defer until the designer is proven.
- Payments and admin come after the buyer-side flow is solid — payments are slow to integrate but rarely surprising.
- Accessibility and performance are scheduled as a phase but should be **considered throughout** — they're not bolted on.

## Related

- [Designer philosophy](./04-designer-philosophy.md) — why designer-first
- [Tech stack](./21-tech-stack.md)
- [Constraints & quality bar](./23-constraints-and-quality.md)
