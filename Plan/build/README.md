# Build Plans

Execution plans for actually building the AcrylixCo site. Architecture and requirements live in [`../`](../README.md) — this directory is *how* we build, not *what*.

## Approach

We build in phases. Each phase produces working, demoable software. We plan one phase in detail, execute it, demo, then plan the next phase with whatever we learned.

This is intentional. The alternative — planning all seven phases up front — produces a document that's stale before it's done and brittle to anything we discover during execution.

The high-level roadmap (which phases exist, in what order, why) is in [`../22-implementation-phases.md`](../22-implementation-phases.md). The individual phase plans below are the bite-sized execution detail.

## Phase plans

| Phase | Status | Plan |
| --- | --- | --- |
| 0 — Foundations | **✅ DONE — live at https://acrylixco-production.up.railway.app** | [`phase-0-foundations.md`](./phase-0-foundations.md) |
| 1 — Designer migration | **✅ DONE — `/customize` live, geometry tests pinning offset-outline** | [`phase-1-designer-migration.md`](./phase-1-designer-migration.md) |
| 2 — Storefront | **✅ DONE — `/`, `/shop`, `/shop/[slug]` live with seeded catalog; SEO + content pages shipped** | [`phase-2-storefront.md`](./phase-2-storefront.md) |
| 3 — Commerce | Not yet planned | _will be written after Phase 2 ships_ |
| 4 — Admin | Not yet planned | _will be written after Phase 3 ships_ |
| 5 — Quality & launch | Not yet planned | _will be written after Phase 4 ships_ |

## Phase 0 — what's done, what's pending

**Done locally (15 commits on `main`):**
- Git repo initialized; existing planning + prototype committed.
- Next.js 16 + React 19 + Tailwind v4 scaffold at `site/` (with strict TypeScript).
- AcrylixCo theme tokens (cream / ink / accent) + self-hosted fonts (Bricolage Grotesque / Fraunces / JetBrains Mono).
- Prettier + ESLint flat config + Husky pre-commit hook (lint-staged + tsc on every commit).
- Vitest unit tests + Playwright E2E with sanity tests passing.
- GitHub Actions CI workflow file (`.github/workflows/ci.yml`) — runs once pushed.
- Local Postgres 16 via Homebrew with `acrylixco` role/db.
- Drizzle ORM + Auth.js compatible schema (`users`, `accounts`, `sessions`, `verification_tokens`) with first migration applied.
- Auth.js v5 (beta.31) with credentials provider + Drizzle adapter. `/api/auth/session` returns 200.
- Base layout (Header / Footer) + "Coming soon" hero on `/`.

**Production deploy verified:**
- https://acrylixco-production.up.railway.app/ → HTTP 200, hero renders
- https://acrylixco-production.up.railway.app/api/auth/session → HTTP 200, `null` (no `UntrustedHost`)
- Drizzle migrations applied to Railway-managed Postgres
- Auto-deploys from `main` on push

Steps are fully scripted in [`phase-0-foundations.md`](./phase-0-foundations.md#task-12-vercel-preview-deployment). They're marked human-only because they need accounts and credentials this build agent doesn't have.

**Known follow-ups that surfaced during execution** (not blockers, addressed in later phases):
- Next 16 deprecated `middleware.ts` in favour of `proxy.ts` — Auth.js v5 docs still use `middleware`. Rename when Auth.js docs catch up.
- Auth.js `UntrustedHost` warning fixed in production via `AUTH_TRUST_HOST=true`. The `.env.local` template now includes it for local dev.
- Multiple stray `package-lock.json` files in parent directories produce a workspace-root warning — set `turbopack.root` in `next.config.ts` to suppress.
- Railway injects `PORT=8080` at runtime; the public domain target port must match. Set the start script to `next start -p ${PORT:-3000} -H 0.0.0.0` and the domain target port to 8080. Documented in [`phase-0-foundations.md`](./phase-0-foundations.md#task-12-railway-deployment).

## Where the prototype fits

[`../../prototype-3d-preview/`](../../prototype-3d-preview/) is a working Vite-based prototype of the 3D designer. It validated the riskiest piece (offset-outline geometry + material rendering + mobile perf) without the cost of full site infrastructure.

Phase 0 does **not** touch the prototype. It scaffolds the production Next.js app in a new directory `site/`. Phase 1 ports the prototype's geometry, materials, scene, and UI primitives into the production app.

After Phase 1 ships, the prototype directory can be deleted (it'll be redundant). Until then, it stays on disk as reference and a working demo.

## Conventions

- **TDD where applicable** — feature work uses red/green/refactor. Setup tasks (install X, configure Y) use "do, verify, commit" instead.
- **Frequent commits** — every numbered task ends with a commit. No giant "phase 0 done" commits.
- **Exact file paths and commands** — plans assume an engineer with no project context. They should be able to follow the steps without asking.
- **No placeholders** — every step shows the actual content needed.

## Related

- [`../22-implementation-phases.md`](../22-implementation-phases.md) — phase rationale and ordering
- [`../21-tech-stack.md`](../21-tech-stack.md) — technology choices each phase builds on
- [`../23-constraints-and-quality.md`](../23-constraints-and-quality.md) — quality bar every phase has to clear
