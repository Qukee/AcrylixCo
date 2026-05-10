# Frames, Shapes & Decorative Elements

A library of pre-made vector assets the customer can drop into compositions. All assets are **vector** and must scale and integrate cleanly with the [layer system](./06-layer-system.md) and [offset-outline engine](./07-offset-outline-generation.md).

## Asset categories

### Base shapes

Used as the underlying form for compositions:

- Rectangle
- Rounded rectangle
- Circle
- Oval
- Heart
- Arch
- Plaque
- Hexagon
- Cloud

### Decorative borders / frames

Cut-out patterns that surround text:

- Geometric Islamic lattice
- Floral wreath
- Art deco
- Simple ring
- Scalloped
- Beaded

### Companion shapes

Standalone themed shapes that sit alongside text:

- Carousel
- Crown
- Star
- Heart
- Balloon
- Flower
- **Religious symbols**: cross, crescent, Star of David, Om
- **Seasonal motifs**: snowflake, Christmas tree, pumpkin, Easter egg

## Integration requirements

Every asset must:

- Be a clean **vector path** (SVG-compatible).
- Have well-formed geometry — no self-intersections, no zero-area subpaths.
- Survive the [offset-outline](./07-offset-outline-generation.md) operation without producing artifacts.
- Scale to any size in the catalog without rasterization.
- Carry **metadata**: name, category, suggested usage, default size, occasion tags.

## Customer-facing UX

- Browse assets by category and by occasion tag.
- Drag-drop or tap-to-add into the canvas.
- Resize, rotate (within template constraints).
- Each asset becomes its own [layer](./06-layer-system.md) — the offset-outline engine treats it the same as a text foreground.

## Admin requirements

- Upload new SVG assets without code changes.
- Tag with category, occasion, and any cultural/religious metadata for filtering.
- Validate on upload: clean geometry, single closed path or well-formed compound path, reasonable file size.

## Open questions

- Should some decorative borders be **only available as base shapes** (not standalone foregrounds)? Probably yes for cut-out lattices.
- Multi-cultural sensitivity — do we need a moderation step before religious/cultural symbols are surfaced?
- Custom uploads — do customers ever upload their own SVG/logo? Out of scope for v1; could be added later as a reviewed-by-admin flow.

## Related

- [Layer system](./06-layer-system.md)
- [Offset-outline generation](./07-offset-outline-generation.md)
- [Composition templates](./05-composition-templates.md) — templates compose decorative elements + text
- [Admin dashboard](./17-admin-dashboard.md) — asset library management
