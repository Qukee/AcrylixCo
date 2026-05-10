# Custom Designer — Philosophy & Scope

This is the **highest-priority part of the build** and the differentiator for AcrylixCo. Before specifying any individual feature of the designer, the philosophy below has to be agreed because it shapes every other decision.

## Mental model

The designer is **not a "text personalization" tool**. The right reference points are simplified Figma or Cricut Design Space — a layered acrylic composition builder.

It is also **not a blank canvas**. Customers always start from a curated template and customize from there.

## Design philosophy: medium freedom with strong defaults

- **Customers start from curated templates**, not a blank canvas.
- They can meaningfully customize within a template — text, materials, sizes, layer arrangements.
- The system steers them toward **on-brand, manufacturable results** rather than offering total freedom.

This means: every freedom we expose has to also produce a piece we can actually laser-cut and ship without designer intervention. Curated paths are the easy paths; raw control is available but not pushed.

## The architectural pieces of the designer

The designer breaks down into these subsystems, each with its own doc:

1. **[Composition templates](./05-composition-templates.md)** — starting points
2. **[Layer system](./06-layer-system.md)** — base / foreground / accent primitive
3. **[Offset-outline generation](./07-offset-outline-generation.md)** — the geometric engine that creates the halo (single most important technical feature)
4. **[Material & finish library](./08-material-finish-library.md)** — what fills each layer
5. **[Typography](./09-typography.md)** — fonts, multi-script support
6. **[Decorative elements](./10-decorative-elements.md)** — frames, shapes, companion motifs
7. **[3D preview](./11-3d-preview.md)** — credibility renderer
8. **[Dimensioning & live pricing](./12-dimensioning-and-pricing.md)** — sizes and price drivers
9. **[Design persistence & order handoff](./13-design-persistence-and-handoff.md)** — save, share, JSON serialization, production-file output
10. **[Mobile experience](./14-mobile-experience.md)** — phone/tablet behavior

## What "done" looks like for the designer

A customer on a phone can:

1. Pick a template (e.g. "Monogram + name").
2. Type their text.
3. Pick a finish swatch from a curated palette.
4. Adjust size and border thickness with a slider.
5. See a realistic 3D preview of what they'll receive.
6. Add to cart with a price that reflects every choice.
7. Receive a piece that matches the preview within the manufacturing tolerances we publish.

Everything in the designer subsystem exists to make that flow feel inevitable.

## Related

- [Business context](./01-business-context.md) — why this is the differentiator
- [Implementation phases](./22-implementation-phases.md) — designer is built first
