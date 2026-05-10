# Tech Stack

Recommendation as of the current spec. Each choice has rationale; the geometry library and the worker for production-file generation are the two areas with genuine alternatives worth weighing.

## Frontend

- **Next.js (React)** — App Router, server components for catalog SEO, client components for the designer.
- **TypeScript** — strict mode. Typed end-to-end (per [constraints](./23-constraints-and-quality.md)).
- **Tailwind CSS** — for marketing surfaces. Designer UI may benefit from a small set of bespoke styles where utility classes hurt readability.

## Designer canvas (2D)

- **Konva** (preferred) or **Fabric.js**.
- Konva has a cleaner React integration via `react-konva` and a more predictable performance profile for shape-heavy scenes. Fabric is feature-rich but heavier and noisier.
- **Decision deferred until a real prototype** — both should be tested with the [offset-outline](./07-offset-outline-generation.md) workload.

## 3D preview

- **Three.js**
- **React Three Fiber** for React integration
- **drei** for utilities (orbit controls, environment, HDR loading)

See [3D preview](./11-3d-preview.md) for material/finish rendering requirements.

## Geometry / offset operations

The single most important library choice. Candidates:

- **Paper.js** — pleasant API, solid boolean ops; can be slow on complex script outlines.
- **Clipper / clipper-lib (or paper-clipper)** — battle-tested for offset and boolean operations on polygons; very fast; lower-level API.
- **paper.js + clipper hybrid** — Paper.js for scene management, Clipper-backed offset for the heavy lifting.

Validation has to happen with **real script-font test cases** — the stress case is a flowing cursive name where letter outlines overlap.

## Backend

- **Node.js** (TypeScript) for the API.
- **tRPC** or **typed REST (with zod)** — pick one for end-to-end type safety. Likely tRPC for shared types with Next.js.
- **PostgreSQL** for the primary database.
- **Prisma** or **Drizzle** as the ORM — Drizzle for performance and SQL transparency, Prisma for ergonomics. Lean Drizzle.

## File storage

- **S3** (or equivalent — Cloudflare R2 is a strong cheaper alternative) for:
  - Rendered preview images
  - Production-ready vector files
  - Customer-uploaded assets if/when supported

## Production-file generation

The per-layer SVG/PDF generation may be heavy enough to warrant a **separate worker** rather than running inline with the order request:

- A Node service that consumes a job queue (BullMQ on Redis, or Postgres-backed queue).
- Generates files, uploads to S3, marks order ready in the DB.
- Decoupling protects API latency and lets us scale generation independently.

## Payments

- **Stripe** — primary processor. Cards, Apple Pay, Google Pay all flow through it.
- **PayPal** — separate SDK / checkout flow.
- **Afterpay** — direct integration (also available via Stripe for some markets; check Australian availability).

See [payments & checkout](./15-payments-and-checkout.md).

## Email

- **Resend** or **Postmark** — transactional email, templates editable from admin.

## Analytics

- **Google Analytics 4** — see [SEO & content](./19-seo-and-content.md).

## Hosting

- **Vercel** for the Next.js frontend.
- **Managed Postgres** (Neon, Supabase, or RDS).
- **Separate worker host** for production-file generation (Fly.io, Railway, or a small EC2 — wherever Postgres lives).
- **Cloudflare** in front for asset CDN and DDoS protection.

## Why this stack

- React/Next.js is the path of least resistance for the team most likely to extend this in the future.
- Three.js / R3F for 3D is the mature, well-documented choice — anything else means custom infrastructure for a non-core capability.
- Stripe + PayPal + Afterpay covers the Australian payment landscape with the fewest moving parts.
- Postgres handles both relational catalog data and JSON design documents well — no need for a second database.

## Open questions

- Konva vs Fabric — needs a prototype.
- Paper.js vs Clipper vs hybrid — needs prototype with script fonts.
- Drizzle vs Prisma — small preference for Drizzle; either works.
- Vercel vs self-hosted — Vercel is fastest to ship; self-hosted is cheaper at scale. Start on Vercel.
- Where to run the generation worker — depends on where Postgres ends up.

## Related

- [Implementation phases](./22-implementation-phases.md) — what to validate first
- [Constraints & quality bar](./23-constraints-and-quality.md) — performance targets the stack has to meet
- [Offset-outline generation](./07-offset-outline-generation.md) — drives geometry library choice
- [3D preview](./11-3d-preview.md) — drives 3D stack
