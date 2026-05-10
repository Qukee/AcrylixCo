# Build Plans

Execution plans for actually building the AcrylixCo site. Architecture and requirements live in [`../`](../README.md) — this directory is *how* we build, not *what*.

## Approach

We build in phases. Each phase produces working, demoable software. We plan one phase in detail, execute it, demo, then plan the next phase with whatever we learned.

This is intentional. The alternative — planning all seven phases up front — produces a document that's stale before it's done and brittle to anything we discover during execution.

The high-level roadmap (which phases exist, in what order, why) is in [`../22-implementation-phases.md`](../22-implementation-phases.md). The individual phase plans below are the bite-sized execution detail.

## Phase plans

| Phase | Status | Plan |
| --- | --- | --- |
| 0 — Foundations | **Done locally** (Tasks 1–11). [Task 12 (Vercel/GitHub/Neon)](./phase-0-foundations.md#task-12-vercel-preview-deployment) needs human action — see notes below. | [`phase-0-foundations.md`](./phase-0-foundations.md) |
| 1 — Designer migration | Not yet planned | _will be written after Phase 0's remote bits land_ |
| 2 — Storefront | Not yet planned | _will be written after Phase 1 ships_ |
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

**Pending (human action required):**
- Push the repo to GitHub (`git remote add origin … && git push -u origin main`).
- Connect the GitHub repo to Vercel (Root Directory: `site`).
- Provision a Neon `dev` Postgres branch, set Vercel env vars (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`), apply the Drizzle migration to Neon.
- Verify a preview URL renders and `/api/auth/session` returns 200.

Steps are fully scripted in [`phase-0-foundations.md`](./phase-0-foundations.md#task-12-vercel-preview-deployment). They're marked human-only because they need accounts and credentials this build agent doesn't have.

**Known follow-ups that surfaced during execution** (not blockers, addressed in later phases):
- Next 16 deprecated `middleware.ts` in favour of `proxy.ts` — Auth.js v5 docs still use `middleware`. Rename when Auth.js docs catch up.
- Auth.js dev shows `UntrustedHost` warning at `/api/auth/session` — fix by setting `AUTH_TRUST_HOST=true` for local dev when the login UI lands.
- Multiple stray `package-lock.json` files in parent directories produce a workspace-root warning — set `turbopack.root` in `next.config.ts` to suppress.

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
