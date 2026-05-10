# AcrylixCo E-Commerce Website Build — Detailed Specification

## Business Context

I own **AcrylixCo**, a custom acrylic engraving and laser-cut decor business based in Sydney, Australia. We produce decorative and commemorative acrylic pieces for life events and occasions including baby showers, birthdays, weddings, anniversaries, public holidays (Christmas, Easter, Mother's/Father's Day, Valentine's Day), religious holidays (Eid/Ramadan, Diwali, Hanukkah, Christmas), corporate gifts, and personalized home decor.

Our signature look is **multi-layered laser-cut acrylic** — typically a foreground piece (text or decorative shape) bonded on top of a slightly larger base piece cut to follow the foreground's contour with an offset, creating a halo of color around the design. Pieces span a range of finishes (mirror, matte, frosted, gloss, glitter, neon) and color palettes, with mounted stands for tabletop display.

I need a production-ready e-commerce website built. Please act as a senior full-stack engineer and product designer. **Ask clarifying questions before making major architectural decisions you're uncertain about** — this is a significant build and I'd rather answer questions upfront than rework large sections later.

## Glossary (use these terms consistently)

- **Foreground layer** — the top acrylic piece, usually the text or main decorative shape
- **Base layer** — the larger acrylic piece underneath, cut to mirror the foreground's contour with an outward offset
- **Offset** — the gap between the foreground edge and the base edge, in millimeters; this is what creates the signature "halo of color" look
- **Finish** — the surface treatment of an acrylic sheet (mirror, matte, frosted, gloss, glitter, neon, clear) — distinct from color
- **Composition** — the overall arrangement of layers, frames, shapes, and text in a single piece
- **Template** — a pre-built starting composition the customer can edit

## Core Requirements

### 1. Standard Product Catalog (Non-Customizable)

A browsable shop displaying our pre-designed, ready-to-ship pieces:

- Categories, filters (occasion, size, finish, color, price), product detail pages, image galleries with zoom, search, related products, reviews
- Inventory tracking with "out of stock" handling and back-in-stock notifications
- Wishlist/favorites

### 2. Custom Product Designer — PRIMARY FEATURE

**This is the differentiator and the highest-priority part of the build. It is not a "text customizer" — it is a layered acrylic composition builder. The right mental model is closer to a simplified Figma or Cricut Design Space than to a generic name-personalization tool.**

The design philosophy is **"medium freedom with strong defaults"**: customers start from curated templates and can meaningfully customize within them, but the system steers them toward on-brand, manufacturable results rather than offering blank-canvas total freedom.

#### 2.1 Composition Templates (the starting point — no blank canvas)

Customers begin by selecting a template. Each template is a pre-built, fully editable composition. Initial template set should include:

- **Name plaque** — single line of text (e.g., "Bob") with foreground over base, freestanding
- **Monogram + name** — large block initial letter as the base shape, script name overlaid (like the "Nora" example, where a serif "N" sits behind a script "Nora")
- **Name in circular frame** — text inside a ring (like the "Olivia" example)
- **Name with subtitle** — primary name with a smaller secondary line below (like "Aisha's First Eid")
- **Bilingual stacked** — two scripts/writing systems stacked, sharing a color palette (like "Yusuf Luo" with Chinese characters)
- **Name with decorative frame** — text inside a cut-out patterned border (geometric Islamic lattice, floral, art deco, simple ring)
- **Name with companion shape** — text plus a separate themed shape (carousel, crown, star, heart, balloon — like the "Gardenia" + carousel example)

The library should be expandable — I need an admin interface to add new templates over time without code changes.

#### 2.2 The Layer System (this is the core technical primitive)

Every design is built from layers. Each piece typically has 2 layers, sometimes 3:

- **Base layer** (always present) — the bottom acrylic sheet
- **Foreground layer** (always present) — the top acrylic piece, usually the text
- **Accent layer** (optional) — a third layer for compositions like "script name over block letter" where there are effectively two foreground elements

Each layer has independent properties: shape/text content, font (for text layers), material color, finish, and thickness.

#### 2.3 Automatic Offset-Outline Generation (the most important geometric feature)

**This is the single most important technical feature in the entire build.** When the customer types text or selects a shape for the foreground, the system must automatically generate the base layer as that exact shape expanded outward by an adjustable offset.

- The offset is controlled by a slider labeled "Border thickness," ranging roughly 2mm to 15mm, with a sensible default (~5mm)
- The offset must update the base layer geometry in real time as the customer types or adjusts
- The offset must handle complex shapes correctly — script fonts with overlapping letters should produce a single unified base outline (a union of the offset shapes), not separate offset blobs per letter
- For multi-line or multi-element compositions, the customer should be able to choose whether the base is one unified shape or separate-per-element

This offset-outline behavior is what makes an AcrylixCo piece look like an AcrylixCo piece. Get this right and the rest of the canvas falls into place.

#### 2.4 Material & Finish Library (not just a color picker)

Color alone is insufficient — the finish carries half the brand identity. The library should be a curated set of swatches, each combining color + finish:

- **Mirror** — Gold Mirror, Silver Mirror, Rose Gold Mirror, Black Mirror
- **Matte / Pastel** — Sage Matte, Dusty Pink Matte, Baby Blue Matte, Cream Matte, Lavender Matte, Black Matte, White Matte
- **Frosted** — Frosted Sage, Frosted White, Frosted Clear
- **Gloss** — Pink Gloss, White Gloss, Black Gloss, primary colors in gloss
- **Glitter** — Gold Glitter, Silver Glitter, Rose Glitter
- **Neon / Fluorescent** — Neon Pink, Neon Green, Neon Orange
- **Clear** — fully transparent
- **Glow-in-the-dark** — opaque day finish, glowing night finish

Each finish must render distinctly in 3D — mirror with environment reflection, frosted with subsurface softness, matte with flat diffuse shading, glitter with sparkle, neon with high saturation. Color picking alone is not enough.

**Curated palette suggestions:** when the customer picks a foreground color/finish, suggest 3–5 harmonious base options (tone-on-tone, soft contrast, classic pairing) rather than letting them flounder in a full color picker. Allow override but make the curated path the easy path.

#### 2.5 Typography

- Curated font library of 25–40 fonts spanning serif, sans-serif, script, display, and monogram styles (no system-font sprawl — every font in the library should be one I'd be happy to manufacture)
- Per-text-layer controls: font family, size, letter spacing, alignment
- Multi-line support
- Multi-script support (Latin, Chinese, Arabic, Cyrillic at minimum) with appropriate font fallbacks
- Each font must convert reliably to vector outlines for laser cutting — no font that produces unmanufacturable thin strokes at small sizes

#### 2.6 Frames, Shapes & Decorative Elements

A library of pre-made vector assets the customer can drop into compositions:

- **Base shapes**: rectangle, rounded rectangle, circle, oval, heart, arch, plaque, hexagon, cloud
- **Decorative borders/frames**: geometric Islamic lattice, floral wreath, art deco, simple ring, scalloped, beaded
- **Companion shapes**: carousel, crown, star, heart, balloon, flower, religious symbols (cross, crescent, Star of David, Om), seasonal motifs (snowflake, Christmas tree, pumpkin, Easter egg)

All assets are vector and must scale and integrate cleanly with the layer/offset system.

#### 2.7 3D Preview (the credibility feature)

A realistic 3D preview is essential — it justifies the price point and reduces post-purchase complaints. Requirements:

- **Two viewing modes** — 2D (flat, fast, mobile-default) and 3D (realistic, rotatable)
- Realistic rendering of acrylic material: thickness visible from the side, slight gap and shadow between foreground and base layers, accurate finish rendering (mirror reflects environment, frosted softens, matte stays flat, glitter sparkles)
- PBR materials with appropriate refraction index (~1.49 for acrylic) for any transparent/frosted layers
- Orbit controls (rotate, zoom, pan) on desktop; touch gestures on mobile
- Optional stand/base preview — show the piece in a clear acrylic stand for tabletop display
- Subtle ambient scene (neutral studio lighting, soft floor) — not a distracting environment

#### 2.8 Real-World Dimensioning & Live Pricing

- All sizes shown in centimeters with size presets: Small (~20cm wide), Medium (~35cm), Large (~50cm), Extra Large (60cm+)
- Live price recalculation as the customer adjusts size, layer count, finish, font complexity, decorative elements, and stand options
- Price breakdown visible on hover/tap so customers understand what drives cost

#### 2.9 Save, Share, Order Handoff

- "Save design" to customer account (requires login or guest email)
- "Share design via link" — generates a shareable URL of the design state
- "Add to cart" with a thumbnail of the rendered preview
- On order placement, the design serializes to JSON containing: template ID, all layer geometry as SVG paths, font choices, finishes, dimensions, customer text — everything needed to reproduce the design for manufacturing
- A high-resolution rendered preview image is attached to the order
- An admin order view lets me see the rendered design, download production-ready vector files (SVG/PDF) of each layer separately for laser cutting, and view the JSON spec

#### 2.10 Mobile

The designer must work cleanly on phones and tablets — Australian customers shop heavily on mobile. The 2D mode should be the mobile default; 3D mode should be available but performance-tuned for mid-range devices.

### 3. Payments & Checkout

Australian market — these payment methods are required:

- **Stripe** as primary processor
- **PayPal**
- **Afterpay** (critical for Australian market)
- Visa, Mastercard, Amex (via Stripe)
- Apple Pay and Google Pay
- Guest checkout, saved addresses, order confirmation emails
- Australia Post integration for shipping calculator
- GST handling and Australian tax invoicing

### 4. Standard Site Features

- Customer accounts with order history and saved custom designs
- Admin dashboard: products, orders (with custom design viewer + production file download), inventory, templates, fonts, finish library, discount codes
- Email notifications: order confirmation, shipping updates, design proof approval emails for custom orders, abandoned cart
- SEO: meta tags, sitemap, structured data, fast page loads
- Google Analytics 4
- Standard pages: About, FAQ, Shipping & Returns, Contact, Care Instructions
- WCAG 2.1 AA accessibility compliance
- Manageable by me (non-developer) for day-to-day product and order operations

## Tech Stack Guidance

Recommend a stack with rationale. My instinct based on the requirements:

- Frontend: React/Next.js
- 2D canvas: Fabric.js or Konva (pick one with rationale)
- 3D: Three.js with React Three Fiber and drei
- Geometry/offset operations: a robust 2D vector library (Paper.js, Clipper, or similar) — this needs to handle the offset-outline generation reliably for arbitrary text and shapes
- Backend: Node.js with a typed API layer
- Database: PostgreSQL
- File storage: S3 or equivalent for design files, preview images, production vectors
- Payments: Stripe-first, with PayPal and Afterpay as additional options
- Hosting: Vercel for frontend, managed Postgres, separate worker for production-file generation if needed

If you have a better stack recommendation, justify it.

## Deliverables

1. **Clarifying questions first** — before any code, list anything ambiguous about my requirements
2. Recommended tech stack with brief justification
3. Proposed project structure and data model
4. Implementation in logical phases. **Build the custom designer first** (specifically, the layer system + offset-outline generation + 2D canvas) since it's the highest-risk, highest-value feature. A working designer with a fake checkout is more valuable to validate early than a polished checkout with a broken designer.
5. Working code I can run locally with clear setup instructions
6. Production-readiness notes — hosting, payment account setup, domain, what's needed to launch

## Constraints & Preferences

- Modern, premium aesthetic that reflects the craftsmanship of the product — clean typography, generous whitespace, photography-led
- Performance-critical: the 3D canvas must not feel sluggish on mid-range mobile devices
- I (a non-developer) need to maintain product listings, orders, templates, and the finish library without touching code
- Code quality: typed, tested where it matters (especially the offset-outline geometry), documented enough that I could hire a developer later to extend it

---

Do you understand the scope? Confirm understanding, ask any clarifying questions, then propose your tech stack. We'll proceed in phases from there, starting with the layer system and offset-outline geometry.