# 3D Preview

A realistic 3D preview is the **credibility feature** — it justifies the price point and reduces post-purchase complaints. A customer who sees what they'll receive is less likely to be disappointed and more likely to convert.

## Two viewing modes

| Mode | Default on | Purpose |
| --- | --- | --- |
| **2D** | Mobile | Flat, fast, accurate-to-scale composition view. The working canvas while editing. |
| **3D** | Desktop | Realistic, rotatable rendered preview. The "see what you'll get" view. |

Customers can toggle between modes at any time. 2D is always responsive enough to feel free; 3D may take a moment to load on mobile.

## Material rendering

The 3D view must show acrylic as it really is:

- **Visible thickness from the side** — pieces aren't flat decals; you should see the cut edge.
- **Slight gap and shadow between foreground and base layers** — they're physically bonded but the layer separation is part of the look.
- **Accurate finish rendering** per [material library](./08-material-finish-library.md):
  - Mirror reflects environment
  - Frosted softens (subsurface)
  - Matte stays flat
  - Glitter sparkles
  - Neon high-saturation, slight emission
  - Clear: PBR transmission with **refraction index ~1.49** (acrylic's actual IOR)

## Scene & lighting

- **Subtle ambient scene** — neutral studio lighting, soft floor.
- **Not** a distracting environment; the piece is the subject.
- HDR environment for mirror reflections, but rendered subtly.

## Controls

- **Desktop**: orbit (rotate), zoom, pan.
- **Mobile**: equivalent touch gestures (one-finger orbit, pinch zoom, two-finger pan).
- Reset-to-front-view button.

## Optional stand preview

A toggle to show the piece in a **clear acrylic stand** for tabletop display — this is how many pieces ship and customers want to see it.

## Performance

- Must not feel sluggish on mid-range mobile devices (see [mobile experience](./14-mobile-experience.md) and [constraints](./23-constraints-and-quality.md)).
- Implies: lazy-load the 3D engine, use lower-poly geometry on mobile, use compressed environment maps, target 30+ fps on mid-range Android.

## Tech direction

Per [tech stack](./21-tech-stack.md):

- **Three.js** for the 3D engine
- **React Three Fiber** for React integration
- **drei** for utilities (orbit controls, environment, HDR loading, etc.)

## Open questions

- Do we render the 3D view **directly from the same composition data** as the 2D canvas (one source of truth), or a separate 3D scene graph? Strongly favor one source of truth — the 2D and 3D views are projections of the same composition.
- Should we capture a **rendered preview snapshot** for the cart thumbnail, or generate on the fly per cart view? Snapshot is cheaper but stale-prone.
- Do we need a **server-side render** for emails / order confirmations / admin order viewer, or is client-side rendering at order time sufficient?

## Related

- [Material & finish library](./08-material-finish-library.md) — finish rendering rules
- [Layer system](./06-layer-system.md) — composition source data
- [Mobile experience](./14-mobile-experience.md) — performance budget
- [Tech stack](./21-tech-stack.md) — Three.js + R3F
- [Constraints & quality bar](./23-constraints-and-quality.md) — performance target
