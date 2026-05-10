# AcrylixCo — Plan Index

This directory holds the design and architecture for the AcrylixCo e-commerce site, split by concern. Read in order if you want the full picture; jump to a specific file when iterating on one piece.

The original full specification is preserved in [`design_plan.md`](./design_plan.md). The numbered files below are the working docs — edit those, not the original.

## Foundation

- [01 — Business context](./01-business-context.md) — what AcrylixCo is, signature look, market
- [02 — Glossary](./02-glossary.md) — terms used consistently across all docs

## Storefront

- [03 — Standard product catalog](./03-product-catalog.md) — pre-made shop, browsing, inventory

## Custom Designer (primary feature)

- [04 — Designer philosophy](./04-designer-philosophy.md) — "medium freedom with strong defaults"
- [05 — Composition templates](./05-composition-templates.md) — starting points; no blank canvas
- [06 — Layer system](./06-layer-system.md) — base / foreground / accent
- [07 — Offset-outline generation](./07-offset-outline-generation.md) — the critical geometric feature
- [08 — Material & finish library](./08-material-finish-library.md) — color + finish swatches
- [09 — Typography](./09-typography.md) — font library and multi-script support
- [10 — Decorative elements](./10-decorative-elements.md) — frames, shapes, companion motifs
- [11 — 3D preview](./11-3d-preview.md) — credibility renderer
- [12 — Dimensioning & live pricing](./12-dimensioning-and-pricing.md) — sizes, price drivers
- [13 — Design persistence & order handoff](./13-design-persistence-and-handoff.md) — save, share, manufacturing JSON
- [14 — Mobile experience](./14-mobile-experience.md) — phone/tablet behavior

## Commerce & operations

- [15 — Payments & checkout](./15-payments-and-checkout.md) — AU payment methods, GST, shipping
- [16 — Customer accounts](./16-customer-accounts.md) — accounts, order history, saved designs
- [17 — Admin dashboard](./17-admin-dashboard.md) — non-developer-operable admin surface
- [18 — Emails & notifications](./18-emails-and-notifications.md) — transactional comms

## Site quality

- [19 — SEO, analytics & content](./19-seo-and-content.md) — discoverability and standard pages
- [20 — Accessibility](./20-accessibility.md) — WCAG 2.1 AA compliance

## Engineering

- [21 — Tech stack](./21-tech-stack.md) — recommended technologies and rationale
- [22 — Implementation phases](./22-implementation-phases.md) — build order, deliverables
- [23 — Constraints & quality bar](./23-constraints-and-quality.md) — performance, code quality, ops

## Build plans

Detailed, executable plans live in [`build/`](./build/README.md). Architecture above describes *what* and *why*; build plans describe *how* and in *what order*, one phase at a time.

## Reading order for the designer subsystem

If you only have time to read the designer pieces in dependency order:

1. [Layer system](./06-layer-system.md) — primitive
2. [Offset-outline generation](./07-offset-outline-generation.md) — the geometric engine that makes layers look like AcrylixCo
3. [Material & finish library](./08-material-finish-library.md) — what fills the layers
4. [Typography](./09-typography.md) and [Decorative elements](./10-decorative-elements.md) — what becomes a foreground
5. [Composition templates](./05-composition-templates.md) — pre-built arrangements of the above
6. [3D preview](./11-3d-preview.md) — how it's rendered
7. [Dimensioning & pricing](./12-dimensioning-and-pricing.md), [Persistence & handoff](./13-design-persistence-and-handoff.md), [Mobile](./14-mobile-experience.md) — outer concerns
