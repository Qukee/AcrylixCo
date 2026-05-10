# AcrylixCo

Custom acrylic engraving and laser-cut decor — Sydney, Australia.

## Repository layout

- `Plan/` — architecture and build plans
- `prototype-3d-preview/` — Vite prototype of the 3D designer (lifts into `site/` in Phase 1)
- `site/` — production Next.js application

## Environments

- **Production**: https://acrylixco-production.up.railway.app — auto-deploys from `main` via Railway
- **Local dev**: http://localhost:3000 — see `Plan/build/local-dev-setup.md`
- **CI**: GitHub Actions — lint, typecheck, unit, e2e, build on every push and PR
- **Database**: Railway-managed Postgres (production), local Postgres via Homebrew (dev)

## Getting started

See `Plan/build/local-dev-setup.md` for local setup, or `Plan/build/phase-0-foundations.md` for the full bootstrap history.
