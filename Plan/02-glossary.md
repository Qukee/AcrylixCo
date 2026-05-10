# Glossary

These terms are used consistently across all design and architecture docs. When in doubt, check here before introducing a synonym.

| Term | Meaning |
| --- | --- |
| **Foreground layer** | The top acrylic piece, usually the text or main decorative shape. |
| **Base layer** | The larger acrylic piece underneath, cut to mirror the foreground's contour with an outward offset. Always present. |
| **Accent layer** | An optional third layer for compositions like "script name over block letter" — effectively a second foreground element. |
| **Offset** | The gap (in millimetres) between the foreground edge and the base edge. The thing that creates the signature "halo of color" look. |
| **Finish** | The surface treatment of an acrylic sheet (mirror, matte, frosted, gloss, glitter, neon, clear, glow-in-the-dark). Distinct from color. |
| **Composition** | The overall arrangement of layers, frames, shapes, and text in a single piece. |
| **Template** | A pre-built starting composition the customer can edit. The designer never starts from a blank canvas. |
| **Piece** | A single finished, manufacturable design — corresponds to one customer order item. |
| **Material** | A specific (color, finish) pairing in our library, e.g. "Gold Mirror" or "Sage Matte". |
| **Swatch** | The customer-facing UI representation of a material. |
| **Production file** | A vector file (SVG / PDF) generated per layer, ready to send to the laser cutter. |

## Naming rules

- Sizes are always in **centimetres** in customer-facing UI.
- Offsets are always in **millimetres** in customer-facing UI.
- "Color" alone is never sufficient — UI always pairs color with finish.

## Related

- [Layer system](./06-layer-system.md)
- [Material & finish library](./08-material-finish-library.md)
- [Offset-outline generation](./07-offset-outline-generation.md)
