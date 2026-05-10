# Material & Finish Library

A material is a (color, finish) pairing. The library is **not a color picker** — color alone is insufficient because the finish carries half the brand identity.

Customers always pick from a **curated set of swatches**, each representing a real acrylic sheet we stock and can manufacture from.

## Initial library

### Mirror

- Gold Mirror
- Silver Mirror
- Rose Gold Mirror
- Black Mirror

### Matte / Pastel

- Sage Matte
- Dusty Pink Matte
- Baby Blue Matte
- Cream Matte
- Lavender Matte
- Black Matte
- White Matte

### Frosted

- Frosted Sage
- Frosted White
- Frosted Clear

### Gloss

- Pink Gloss
- White Gloss
- Black Gloss
- Primary colors in gloss (red, yellow, blue, green)

### Glitter

- Gold Glitter
- Silver Glitter
- Rose Glitter

### Neon / Fluorescent

- Neon Pink
- Neon Green
- Neon Orange

### Clear

- Fully transparent

### Glow-in-the-dark

- Opaque day finish, glowing night finish

## Rendering requirements

Each finish must render **distinctly in 3D** ([3D preview](./11-3d-preview.md)):

| Finish | Rendering treatment |
| --- | --- |
| Mirror | Environment reflection (HDR or studio probe) |
| Frosted | Subsurface softness, slight transmission |
| Matte | Flat diffuse shading, low specular |
| Gloss | High specular, sharp highlights |
| Glitter | Sparkle / particulate specular |
| Neon | High saturation, slight emission |
| Clear | PBR transmission with ~1.49 refraction index |
| Glow-in-the-dark | Day mode opaque; night mode emissive |

## Curated palette suggestions

When the customer picks a foreground material, the system **suggests 3–5 harmonious base materials** rather than letting them flounder in a full picker:

- Tone-on-tone (same color family, different finish)
- Soft contrast (complementary pastel)
- Classic pairing (e.g. gold mirror over black matte)

The customer can override and pick any other swatch — but the curated path is the easy path.

## Admin requirements

The owner needs to be able to:

- Add new swatches without code changes.
- Set per-swatch fields: name, color value, finish type, preview image, manufacturing cost factor, in-stock flag.
- Group swatches into the categories above (mirror / matte / frosted / etc.).
- Define curated pairing suggestions (which materials to suggest for the base when X is the foreground).

## Open questions

- Should we model **stock levels per material** (so we can disable or warn when running low) — or treat materials as effectively infinite?
- Pricing — does each finish carry its own cost multiplier in the [pricing engine](./12-dimensioning-and-pricing.md)? Likely yes (mirror and glitter cost more than matte).
- Should we ever surface the **physical sheet thickness** options as a customer choice, or fix it per material?

## Related

- [Layer system](./06-layer-system.md) — materials fill layers
- [3D preview](./11-3d-preview.md) — finish rendering
- [Dimensioning & pricing](./12-dimensioning-and-pricing.md) — cost factors
- [Admin dashboard](./17-admin-dashboard.md) — swatch management
