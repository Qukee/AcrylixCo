# Composition Templates

The designer **never starts from a blank canvas.** The first action is always: pick a template.

Each template is a pre-built, fully editable [composition](./02-glossary.md) — the customer can change text, materials, sizes, fonts, and (within limits) layout, but the structural arrangement is baked in.

## Initial template set

The launch library should include at least:

- **Name plaque** — single line of text (e.g. "Bob") with foreground over base, freestanding.
- **Monogram + name** — large block initial letter as the base shape, script name overlaid (the "Nora" example: a serif "N" sitting behind a script "Nora").
- **Name in circular frame** — text inside a ring (the "Olivia" example).
- **Name with subtitle** — primary name with a smaller secondary line below (the "Aisha's First Eid" example).
- **Bilingual stacked** — two scripts/writing systems stacked, sharing a color palette (the "Yusuf Luo" + Chinese characters example).
- **Name with decorative frame** — text inside a cut-out patterned border (geometric Islamic lattice, floral, art deco, simple ring).
- **Name with companion shape** — text plus a separate themed shape (carousel, crown, star, heart, balloon — the "Gardenia" + carousel example).

## Extensibility

The template library must be **expandable without code changes**. The owner (non-developer) needs to add new templates over time through an admin interface.

This implies templates are **data**, not hard-coded React components. A template is a serializable composition definition that the designer can load and that the admin UI can author.

## What an admin needs to do

- Create a new template by composing layers in the same designer (or a similar admin-only authoring view).
- Set the template's name, occasion tags, default finish suggestions, default text, default size.
- Publish / unpublish templates.
- Reorder templates within a category.

## Open questions

- Should templates have **occasion tags** that tie into catalog filters, or is template browsing a separate taxonomy from catalog browsing?
- Do we want **regional template sets** (e.g. surface Eid templates more prominently in some regions)?
- Should customers be able to **save their own customized template** as a starting point for future orders, or is "save design" enough?

## Related

- [Layer system](./06-layer-system.md) — what a template is composed of
- [Designer philosophy](./04-designer-philosophy.md)
- [Admin dashboard](./17-admin-dashboard.md) — template authoring
- [Design persistence & handoff](./13-design-persistence-and-handoff.md) — serialization format
