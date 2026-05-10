# Mobile Experience

Australian customers shop heavily on mobile. The designer must work cleanly on phones and tablets — not as a desktop-first afterthought.

## Mode defaults

- **2D mode is the mobile default** — fast, responsive, accurate.
- **3D mode is available on mobile** but performance-tuned for mid-range devices.

The mobile UX should never *force* a customer into 3D — they can complete an order in 2D mode end-to-end.

## Performance budget

Target: **mid-range Android** (e.g. 3–4 year old devices, ~$300 AUD price point new).

- 2D canvas: smooth typing, smooth slider drags (no perceptible lag).
- 3D canvas: 30+ fps under normal interaction, lazy-loaded so it doesn't bloat initial page weight.
- [Offset-outline generation](./07-offset-outline-generation.md): stays real-time under typical text inputs.

## Touch interactions

- Tap to select a layer.
- Drag to reposition (within template constraints).
- Pinch to zoom the canvas.
- Two-finger drag to pan.
- 3D mode: one-finger orbit, pinch zoom, two-finger pan.

## Layout

Mobile UX should structure the designer as **tabs or panels**, not a desktop sidebar:

- Compose (canvas + minimal controls)
- Materials (swatch picker)
- Text (font, size, content)
- Size & price
- Preview (3D toggle)

Each panel is full-screen-friendly and can be swiped away to reveal the canvas.

## Known mobile constraints

- No drag-and-drop from "decorative element library" to canvas — use **tap-to-add** instead.
- Long press for context actions where right-click would be used on desktop.
- The keyboard takes a lot of screen space — text editing UX must be canvas-aware (auto-scroll the text into view).
- Limited GPU and memory — 3D scene must be lighter than desktop.

## Open questions

- Should we offer a **simplified-mobile mode** that hides advanced controls (custom offset, fine size tuning) behind a "more" toggle?
- Is there a viable iOS / Android **native app** path, or is responsive web sufficient for v1? (Strong preference for web-only at v1.)
- Do we need to **detect low-power mode** and proactively switch to 2D-only?

## Related

- [3D preview](./11-3d-preview.md)
- [Designer philosophy](./04-designer-philosophy.md)
- [Constraints & quality bar](./23-constraints-and-quality.md) — performance is a hard constraint
