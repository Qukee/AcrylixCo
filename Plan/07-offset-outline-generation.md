# Offset-Outline Generation

> **This is the single most important technical feature in the entire build.** It is what makes an AcrylixCo piece look like an AcrylixCo piece. Get this right and the rest of the designer falls into place.

## What it does

When the customer types text or selects a shape for the [foreground layer](./06-layer-system.md), the system **automatically generates the [base layer](./06-layer-system.md)** as that exact shape expanded outward by an adjustable [offset](./02-glossary.md).

The result: every customer design has the signature halo-of-color base without the customer having to draw it.

## Customer-facing controls

- A slider labeled **"Border thickness"**.
- Range: roughly **2 mm to 15 mm**.
- Default: ~5 mm (sensible mid-range).
- Updates the base geometry in **real time** as the customer types or adjusts.

## Geometric requirements

- Must handle **complex shapes correctly**.
- For **script fonts with overlapping letters**, the offset must produce a **single unified base outline** (a boolean union of the per-glyph offset shapes), not separate offset blobs around each letter.
- For **multi-line or multi-element compositions**, the customer can choose between:
  - **Unified base** — one shape that hugs the union of all foreground elements.
  - **Per-element base** — each foreground element gets its own offset base.
- The chosen mode must produce a **clean, manufacturable outline** — no degenerate self-intersections, no zero-width slivers, no detached fragments.

## Performance requirements

- Must update **in real time** as the customer types or drags the slider.
- Must run smoothly on mid-range mobile devices (see [mobile experience](./14-mobile-experience.md)).
- Implies: the offset operation needs to be debounced/throttled, run incrementally where possible, and use a fast 2D geometry library.

## Library candidates

Per the [tech stack doc](./21-tech-stack.md), the leading candidates are:

- **Paper.js** — solid 2D vector toolkit with boolean ops; pleasant API.
- **Clipper / clipper-lib** — battle-tested for offset and boolean operations on polygons; very fast.
- **paperjs + clipper hybrid** — Paper.js for general scene management, Clipper for the heavy offset/boolean ops.

The choice has to be validated with real text — script fonts with kerning are the stress case.

## What "correct" looks like

Acceptance tests should include:

- A long script name like "Genevieve" in a flowing cursive — the base must be one unified outline, no gaps between letter offsets.
- A multi-line name like "Aisha's First Eid" — both unified-base and per-line-base modes produce clean outlines.
- A heart shape with a script name inside — the offset must respect the heart, not balloon out.
- Sliding the border thickness from 2mm to 15mm — base updates fluidly, no jitter, no broken geometry at the extremes.
- Manufacturing check: the produced SVG path can be loaded into the laser cutter's software and cut as a single contour.

## Open questions

- For **per-element** mode on overlapping foreground elements (e.g. monogram + name where the script overlaps the block letter), how do we handle the overlap region? Likely: each element gets its own offset, and overlaps are allowed (visually they'll bond together when manufactured).
- Should the customer ever be able to **draw a custom base shape** that ignores the foreground? Out of scope for v1 — would break "manufacturable by default" guarantees.
- For very thin script strokes, do we **enforce a minimum stroke width** at the offset level to avoid unmanufacturable outlines? Likely yes — should be defined in the typography subsystem.

## Related

- [Layer system](./06-layer-system.md) — what consumes the offset output
- [Typography](./09-typography.md) — minimum manufacturable stroke widths
- [Tech stack](./21-tech-stack.md) — geometry library choice
- [Implementation phases](./22-implementation-phases.md) — this is built first
