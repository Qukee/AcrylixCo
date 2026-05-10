# Admin Dashboard

The admin surface is **operated by the owner (a non-developer)**. Day-to-day product, order, template, and library operations must be doable here without touching code.

This is a hard constraint — anything that requires re-deploying the site to update is a failure of this surface.

## Sections

### Products

- Create / edit / archive standard catalog products ([product catalog](./03-product-catalog.md)).
- Set price, inventory, images, descriptions, categories, occasion tags.
- Bulk operations (e.g. mark a category as on sale).

### Orders

- Order list with filters (status, date, type, customer).
- Per-order detail view including:
  - **Custom design viewer** with rendered preview ([persistence & handoff](./13-design-persistence-and-handoff.md)).
  - **JSON spec** download.
  - **Production-ready vector files** (SVG / PDF) per layer for laser cutting.
- Status transitions: received → in production → ready to ship → shipped.
- Resend customer notifications.
- Refund / cancel flows.

### Inventory

- Stock levels per standard product.
- Material / sheet stock (informational; affects whether to auto-disable specific [materials](./08-material-finish-library.md)).
- Low-stock alerts.

### Templates

- Author new [composition templates](./05-composition-templates.md) without code.
- Edit existing templates.
- Publish / unpublish.
- Categorize and tag.

### Fonts

- Add new fonts to the [typography library](./09-typography.md) without code.
- Upload font files, set fallback chains for non-Latin scripts, set licensing metadata.
- Activate / deactivate fonts.

### Finish library

- Add / edit / archive material swatches in the [material library](./08-material-finish-library.md).
- Set per-material cost factors that feed the [pricing engine](./12-dimensioning-and-pricing.md).
- Define curated pairing suggestions.

### Decorative assets

- Upload SVG assets to the [decorative element library](./10-decorative-elements.md).
- Tag with category, occasion, cultural metadata.

### Discount codes

- Create / list / disable discount codes.
- Per-code rules: percentage / fixed amount, minimum order, expiry, usage limit, applicable categories.

### Customers (light)

- View customers, their order history, saved designs.
- Communication / support log per customer.

### Site content

- Edit standard content pages (About, FAQ, Shipping & Returns, Contact, Care Instructions) — see [content pages](./19-seo-and-content.md).

## Cross-cutting requirements

- **Auth & roles** — at minimum: owner (full access). Future: staff role, read-only role.
- **Audit log** — record who changed what and when (matters for orders).
- **Search** across orders, customers, products, designs.

## Open questions

- Headless admin (custom UI on top of API) vs an off-the-shelf admin builder? Custom is more polished but slower to build.
- Should admin live on a **subdomain** (`admin.acrylixco.com`) or a path (`/admin`)? Subdomain is cleaner for security separation.
- Notifications inside the admin — do we want real-time order alerts (push, sound, etc.) for the owner?

## Related

- [Product catalog](./03-product-catalog.md)
- [Composition templates](./05-composition-templates.md)
- [Material & finish library](./08-material-finish-library.md)
- [Typography](./09-typography.md)
- [Decorative elements](./10-decorative-elements.md)
- [Design persistence & handoff](./13-design-persistence-and-handoff.md)
- [Emails & notifications](./18-emails-and-notifications.md)
