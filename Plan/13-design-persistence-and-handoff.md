# Design Persistence & Order Handoff

The connective tissue between "customer made a design" and "AcrylixCo manufactures it." This subsystem covers save / share, cart attachment, JSON serialization, and production-file generation.

## Customer-facing actions

### Save design

- "Save design" stores the in-progress composition to the customer's account.
- Requires login (or capture guest email so we can email a recovery link).
- Customers can revisit and edit saved designs.

### Share design via link

- Generates a shareable URL representing the **design state** at that moment.
- Recipients open the link and see the design in the designer (read-only by default; can be cloned to edit).

### Add to cart

- Adds the current design as a cart line item.
- Cart line item carries a **thumbnail of the rendered preview** so customers can identify it.
- Cart line item also carries a **summary of the design metrics** so price, fulfilment, and analytics don't need to re-open the JSON to read them. At a minimum:
  - **Fonts used** (per text layer: family + weight)
  - **Materials used** (per layer: name, finish, color)
  - **Dimensions** (overall width × height in cm, per-layer thickness in mm)
  - **Border thickness** (mm)
  - **Layer count**
  - These same fields appear on the order confirmation and the [admin order view](#admin-order-view) without needing to deserialise the full JSON.

## Order serialization

When an order is placed, the design serializes to **JSON** containing everything needed to reproduce the design for manufacturing:

- Template ID (which template the design started from)
- All [layer](./06-layer-system.md) geometry as **SVG paths** (foreground, base, accent)
- Font choices (font family + version + linked vector outlines)
- Materials (color + finish per layer)
- Dimensions (overall and per-layer in centimetres / millimetres)
- Customer text content (with original Unicode preserved for multi-script)
- Offset value used
- Selected stand option

A **high-resolution rendered preview image** (PNG) is attached to the order alongside the JSON.

## Admin order view

The admin order viewer provides:

- **Rendered preview** of the design.
- **JSON spec** — viewable and downloadable.
- **Production-ready vector files** (SVG / PDF) of **each layer separately**, ready for the laser cutter.
  - One file per layer (foreground, base, accent).
  - Correct stroke / fill conventions for the laser software.
  - Per-file metadata: material, thickness, dimensions.
- Order status workflow: received → in production → ready to ship → shipped.
- Link to send the customer a **design proof approval email** (see [emails](./18-emails-and-notifications.md)).

## File storage

Per [tech stack](./21-tech-stack.md):

- Design JSON: PostgreSQL (small, queryable).
- Rendered preview images: S3 (or equivalent).
- Production vector files: S3 (or equivalent), generated on demand or at order placement.

## Production file generation

The production files (per-layer SVG/PDF for the laser) need to be generated reliably. Options:

- **At order placement** — preferred, so they're ready when the admin opens the order.
- **On demand from the admin view** — fallback, lets us regenerate if the format ever changes.
- A **separate worker service** for this task makes sense if generation is slow or memory-intensive.

## Versioning

The design JSON should carry a **schema version** so we can evolve the format without breaking historical orders. Old orders must remain renderable and re-cuttable indefinitely.

## Open questions

- For shared design links, should the design state be **immutable** (changes don't affect the recipient's link) or **live** (recipient sees latest)? Immutable is safer.
- Do we need an **abandoned design** recovery flow (email customers who started a design but didn't checkout)? Probably yes — see [emails](./18-emails-and-notifications.md).
- Should the customer be able to **download their design as an image** before purchase, or is that a piracy risk?

## Related

- [Layer system](./06-layer-system.md) — what's serialized
- [3D preview](./11-3d-preview.md) — preview snapshot generation
- [Admin dashboard](./17-admin-dashboard.md) — order viewer
- [Emails & notifications](./18-emails-and-notifications.md) — proof approvals
- [Customer accounts](./16-customer-accounts.md) — saved designs
