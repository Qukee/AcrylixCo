# Constraints & Quality Bar

Cross-cutting requirements that apply across every part of the build. These are non-negotiable.

## Aesthetic

- **Modern, premium aesthetic** that reflects the craftsmanship of the product.
- Clean typography, generous whitespace, **photography-led** product surfaces.
- The site itself has to look like the kind of place that sells what we sell — generic e-commerce templating undercuts our price point.

## Performance

- The **3D canvas** must not feel sluggish on mid-range mobile devices ([3D preview](./11-3d-preview.md), [mobile](./14-mobile-experience.md)).
- The **[offset-outline generation](./07-offset-outline-generation.md)** must update in real time as the customer types or drags the slider — no perceptible lag.
- **Core Web Vitals** green for catalog and content pages.
- 3D engine loaded lazily — never blocks first paint.

## Operability (non-developer ownership)

The owner (non-developer) needs to maintain the following **without touching code**:

- Product listings ([catalog](./03-product-catalog.md))
- Orders, including viewing custom designs and downloading production files ([persistence](./13-design-persistence-and-handoff.md))
- [Templates](./05-composition-templates.md)
- [Typography library](./09-typography.md)
- [Material & finish library](./08-material-finish-library.md)
- [Decorative elements](./10-decorative-elements.md)
- Discount codes
- Standard content pages

If any of these requires a developer, the [admin dashboard](./17-admin-dashboard.md) has failed.

## Code quality

- **Typed end-to-end** (TypeScript strict mode, shared types between client and server).
- **Tested where it matters** — particularly the [offset-outline geometry](./07-offset-outline-generation.md). Visual regression / golden-file tests for known inputs (script names, multi-line, complex shapes).
- **Documented enough** that the owner can hire a developer later to extend it without spelunking.
- No clever tricks where boring code will do — this codebase outlives the initial build.

## Manufacturability

Every choice that ends up in a customer's design has to translate to a manufacturable piece:

- Fonts can't produce unmanufacturable thin strokes ([typography](./09-typography.md)).
- Geometry from the offset engine has to laser-cut as a single contour ([offset-outline](./07-offset-outline-generation.md)).
- Decorative assets must be clean vector geometry ([decorative elements](./10-decorative-elements.md)).
- The [order handoff](./13-design-persistence-and-handoff.md) JSON has to be sufficient to reproduce the design.

The system steers customers toward manufacturable outcomes by default; raw freedom is allowed but never the easy path.

## Compliance

- **WCAG 2.1 AA** ([accessibility](./20-accessibility.md)).
- **Australian Privacy Principles** for customer data and analytics consent.
- **GST** handling per Australian tax rules ([payments](./15-payments-and-checkout.md)).

## What "ready to launch" looks like

- Designer works end-to-end on mid-range Android and iOS, including 3D preview at 30+ fps.
- Catalog browsable, searchable, filterable.
- Real Australian payments work (Stripe + PayPal + Afterpay), including Apple Pay / Google Pay.
- Tax invoices generated correctly with our ABN.
- Australia Post shipping calculator returns live rates.
- Admin can manage every piece of content (products, templates, fonts, finishes, decorative assets, discount codes, content pages) without code changes.
- Order handoff produces correct per-layer production files for the laser cutter.
- Accessibility CI passes; manual screen reader walkthrough of catalog and checkout passes.
- Core Web Vitals are green on real-device measurements.
- Error tracking, basic monitoring, and logging are in place.

## Related

- [Implementation phases](./22-implementation-phases.md) — when each constraint becomes acceptance criteria
- [Tech stack](./21-tech-stack.md) — choices that protect these constraints
- [Mobile experience](./14-mobile-experience.md) — performance budget
- [Accessibility](./20-accessibility.md) — compliance bar
