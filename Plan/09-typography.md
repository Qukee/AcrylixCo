# Typography

The font library is curated. Every font is one the owner is happy to manufacture — there is no "browse all Google Fonts" sprawl.

## Library size & breadth

- **25–40 fonts** at launch.
- Spans serif, sans-serif, script, display, and monogram styles.
- Each font is selected for visual quality **and** manufacturability.

## Per-text-layer controls

- Font family
- Size
- Letter spacing (tracking)
- Alignment (left, center, right; per-line)
- Multi-line support

## Multi-script support

Required at minimum:

- Latin
- Chinese
- Arabic
- Cyrillic

Each script needs **appropriate font fallbacks** so a customer typing in Arabic doesn't end up with Latin glyphs from a Latin-only font.

The fallback chain is per-font: each curated Latin font is paired with a chosen companion font for Chinese, Arabic, Cyrillic where the original font lacks coverage.

## Manufacturing constraints

Each font must convert reliably to **vector outlines for laser cutting**:

- No font that produces **unmanufacturable thin strokes** at small sizes.
- Define a **minimum stroke width** the laser can reliably cut (e.g. 1.5 mm at the smallest size the customer can choose).
- The system should **warn** (not silently break) if the customer's chosen font + size combination falls below this threshold.
- Boolean operations on the font outlines (used in [offset-outline generation](./07-offset-outline-generation.md)) must produce clean results — no degenerate self-intersections.

## Storage & licensing

- Self-host the font files (don't depend on Google Fonts CDN at runtime — too many manufacturing implications).
- Store the original `.ttf` / `.otf` for vector extraction at order time.
- Store webfont versions (`.woff2`) for the designer UI.
- Track license per font — only include fonts whose licenses permit commercial use, embedding, and modification (the latter for outline conversion).

## Open questions

- Should customers see **previews of every font** in their typed text, or only the currently selected one? Live previews are nicer but expensive at 25–40 fonts.
- Do we want **font categories / tags** (e.g. "wedding," "playful," "geometric") for easier discovery?
- Should the admin be able to **add fonts without code**, or is this rare enough that engineering involvement per font is fine? Leaning admin-driven for parity with templates and finishes.

## Related

- [Offset-outline generation](./07-offset-outline-generation.md) — operates on font outlines
- [Layer system](./06-layer-system.md) — text content lives on text layers
- [Composition templates](./05-composition-templates.md) — templates pick default fonts
- [Admin dashboard](./17-admin-dashboard.md) — font library management
