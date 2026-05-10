# Accessibility

Target: **WCAG 2.1 Level AA** compliance across the site.

## Site-wide baseline

- Semantic HTML — proper landmark roles (`main`, `nav`, `header`, `footer`).
- Headings in logical order (no skipped levels).
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text.
- Visible focus indicators on every focusable element.
- All interactive controls reachable and operable via keyboard.
- All images have meaningful `alt` text (or empty `alt=""` for purely decorative).
- Forms have associated labels and clear error messages.
- Skip-to-content link.
- Respect `prefers-reduced-motion` for non-essential animations.

## Designer-specific accessibility

The [custom designer](./04-designer-philosophy.md) is harder than typical e-commerce because it's a canvas-based tool. Practical bar:

- All controls (font picker, finish picker, size, border thickness, layer toggle, save/share) are **keyboard-accessible**.
- The **canvas state is announced** to assistive tech via ARIA live regions when key things change (e.g. "Border thickness now 5 millimeters", "Foreground material set to Gold Mirror").
- A **non-canvas alternative path** for adding text: customers should be able to type, choose font, choose material, and complete an order without ever needing to interact with the canvas directly.
- The 3D preview is a visual enhancement — the order flow must complete without it.
- Provide **text descriptions** of the design state for screen readers ("3-layer composition: 'Aisha' in Sage Matte over base in Gold Mirror with 5mm border").

## Catalog & checkout

- Catalog filtering, search, and product detail pages must be fully usable with keyboard and screen reader.
- Checkout forms have clear labels, error messages, and an accessible payment flow.

## Testing

- Automated checks (e.g. axe-core) wired into CI.
- Manual keyboard-only walkthrough of: catalog browse → product detail → add to cart → checkout.
- Manual keyboard-only walkthrough of: pick template → enter text → choose material → add to cart.
- Screen reader spot checks on critical flows (NVDA / VoiceOver).

## Open questions

- For the canvas designer, are we aiming at full **screen reader operability** (very expensive to do well) or "all controls work; canvas itself is decorative for SR users"? Plan suggests the latter — confirm.
- Do we need **WCAG 2.1 AAA** anywhere (e.g. checkout)? AA is the stated bar; AAA is not committed.

## Related

- [Designer philosophy](./04-designer-philosophy.md)
- [3D preview](./11-3d-preview.md) — visual enhancement, not required path
- [SEO & content](./19-seo-and-content.md) — overlap on semantic markup
- [Constraints & quality bar](./23-constraints-and-quality.md)
