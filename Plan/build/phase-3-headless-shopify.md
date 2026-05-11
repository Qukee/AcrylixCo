# Phase 3 — Commerce on Headless Shopify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder "Add to cart" buttons and localStorage cart with real commerce backed by Shopify, without giving up the custom Next.js frontend, the 3D customizer at `/customize`, the 2D mini-editor on PDPs, or any of the Phase 2.5–2.9 brand work.

**Architecture:** Headless Shopify. Next.js stays the user-facing frontend at `acrylixco-production.up.railway.app`. Shopify becomes the canonical catalog, cart, checkout, payments, inventory, tax, and customer-accounts backend. Storefront API (public, customer-facing) for reads + cart writes; Admin API (server-only) for orders/webhooks; Customer Account API for login. Our Postgres keeps a thin `orders` mirror for the studio production queue.

**Tech Stack:** existing Next.js 16 + Tailwind v4 + Drizzle + Auth.js. Adds `@shopify/storefront-api-client`. Removes Auth.js + most of `db/schema/catalog.ts` (deferred to Phase F).

**Out of scope:** internationalisation / multi-currency (Shopify Markets), B2B / wholesale, recurring subscriptions, the admin dashboard (Phase 4), production-queue UI (Phase 4 — for now the queue is a DB table only).

**Owner decisions (all approved 2026-05-11):**
1. ✅ Shopify Basic plan
2. ✅ Shopify Collections for the dual-axis taxonomy (multi-collection per product)
3. ✅ Customer Accounts API (new, passwordless magic-link)
4. ✅ Freeze `db/schema/catalog.ts` after migration (don't delete)
5. ✅ API-driven product import via script (B.5, not B.4 CSV)

---

## Phase A — Pre-flight (owner-driven Shopify setup)

This phase doesn't need me — the owner does it once. Everything after Phase A is agent-driven and can move in parallel.

- [ ] **A.1: Create a Shopify store** at https://shopify.com/au. Plan: **✅ DECIDED (owner approved 2026-05-11) — Basic recommended** ($43 AUD/mo). Store URL will be `acrylixco.myshopify.com` (or chosen subdomain). The customer-facing domain stays our Railway one — Shopify only hosts checkout.
- [ ] **A.2: Enable Shopify Payments**. Submit business details + ABN. Approval takes 24–48 hrs.
- [ ] **A.3: Enable Afterpay** under Settings → Payments → Alternative payment methods. AU merchants in good standing on Shopify Payments are pre-approved.
- [ ] **A.4: Enable PayPal Express** (optional but customary in AU).
- [ ] **A.5: Configure shipping zones**: Australia → Australia Post live rates (Shopify Shipping AU is the simplest path; alternative is the "Australia Post App" by Shopify). Set free-shipping threshold at $150 AUD to match our promo bar.
- [ ] **A.6: Configure tax**: Australia → GST registered, prices entered tax-inclusive (Shopify will display GST on invoices automatically).
- [ ] **A.7: Brand the checkout**: Settings → Checkout → Branding. Upload logo, set primary action colour `#b77b5e` (terracotta-500), accent `#2c2920` (ink-900), font `Fraunces` for headings if available else system serif.
- [ ] **A.8: Create a custom app for Storefront API**: Settings → Apps and sales channels → Develop apps → "Create an app" named `AcrylixCo Next Frontend`. Storefront API access scopes: `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`, `unauthenticated_write_customers`, `unauthenticated_read_customers`. Generate the Storefront access token.
- [ ] **A.9: Create a custom app for Admin webhooks**: same admin path, named `AcrylixCo Webhooks`. Admin API access: `read_orders`, `read_products`. Generate the admin access token (server-only, never expose in client bundle).
- [ ] **A.10: Generate webhook signing secret** in the admin app's API credentials tab. Save for HMAC verification.
- [ ] **A.11: Give me four secrets** to wire up: store domain (`acrylixco.myshopify.com`), Storefront access token, Admin access token, Webhook signing secret. I'll set them as Railway env vars (`SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_ADMIN_TOKEN`, `SHOPIFY_WEBHOOK_SECRET`).

**Definition of done for Phase A:** the owner can log into the Shopify admin, see a (mostly empty) store with Payments + Afterpay enabled, and has handed me the four credentials.

---

## Phase B — Catalog migration (Shopify becomes canonical)

Move the 10 products from our Postgres seed into Shopify. After Phase B, the Next.js storefront reads catalog data from Shopify exclusively.

### Task B.1: Install the Storefront API client

**Files:**
- Modify: `site/package.json`

- [ ] Install: `cd site && npm i @shopify/storefront-api-client graphql`
- [ ] Commit: `chore(deps): add @shopify/storefront-api-client for headless Shopify`

### Task B.2: Storefront client + product types

**Files:**
- Create: `site/src/lib/shopify/client.ts`
- Create: `site/src/lib/shopify/types.ts`

- [ ] `client.ts` exports a singleton `storefront` client created from `process.env.SHOPIFY_STORE_DOMAIN` + `process.env.SHOPIFY_STOREFRONT_TOKEN`, API version `2025-01`.
- [ ] `types.ts` exports `ShopifyProduct`, `ShopifyImage`, `ShopifyMoney`, etc. as TypeScript types matching the GraphQL responses we'll query.
- [ ] Add the four env vars to `site/.env.example` (with placeholder values).

### Task B.3: Product queries — `getProductBySlug`, `getFeaturedProducts`, `getProductsByCategory`, `getRelatedProducts`, `getAllCategories`

**Files:**
- Create: `site/src/lib/shopify/products.ts`
- Modify: `site/src/lib/catalog/queries.ts` — re-export from `shopify/products.ts`, keep the public function signatures unchanged so PDP / Shop / home consumers don't need changes.

- [ ] `getProductBySlug(slug)` queries `productByHandle(handle: $slug)` in Shopify. Map response → existing `ProductSummary` shape so the PDP doesn't need a rewrite.
- [ ] `getFeaturedProducts(n)` queries `products(first: $n, sortKey: BEST_SELLING)`.
- [ ] `getProductsByCategory(slug)` queries `collection(handle: $slug) { products { ... } }`.
- [ ] `getRelatedProducts(productId, n)` queries `productRecommendations(productId: $id)`.
- [ ] `getAllCategories()` queries `collections(first: 50)` and maps `{ handle, title, descriptionHtml, sortOrder }` → `CategorySummary`.
- [ ] **✅ DECIDED (owner approved 2026-05-11)** — Collections vs. tags for the dual-axis taxonomy (occasions × product types). My recommendation: **Collections, two per product** (one occasion collection, one type collection), matching our existing `categoryIds` array. Shopify supports multi-collection products natively.

### Task B.4: One-off CSV export of current catalog

**Files:**
- Create: `site/scripts/export-catalog-to-shopify-csv.ts`

- [ ] Read current seed → emit a Shopify-compatible Product CSV (https://help.shopify.com/en/manual/products/import-export/using-csv) at `/tmp/acrylixco-catalog.csv`. Include image URLs that point to our deployed `https://acrylixco-production.up.railway.app/products/big-letter-product/*.png` so Shopify can pull them on import.
- [ ] CSV columns: Handle, Title, Body (HTML), Vendor, Type, Tags, Published, Option1 Name, Variant Price, Image Src, Image Position, Image Alt Text, SEO Title, SEO Description, Status.
- [ ] Run once locally; owner uploads the CSV via Shopify admin → Products → Import. (Or I drive it via Admin API in B.5 — see below.)

### Task B.5: Bulk import via Admin API (alternative to manual CSV)

**Files:**
- Create: `site/scripts/import-catalog-to-shopify.ts`

- [ ] If the CSV path is friction, instead write a TS script that POSTs each product to the Admin REST API using `process.env.SHOPIFY_ADMIN_TOKEN`. One product per second to stay under rate limits.
- [ ] Includes: product create, image attach (by URL), collection assignment.
- [ ] Idempotent: skip if a product with the same `handle` already exists. Re-runnable.
- [ ] Owner runs `npm run shopify:import` once. **✅ DECIDED (owner approved 2026-05-11)** between B.4 (CSV) and B.5 (API). Recommendation: B.5 — it's faster to iterate when copy or images change.

### Task B.6: Wire ProductMiniEditor's customisation into the Shopify cart

**Files:**
- Modify: `site/src/components/site/ProductMiniEditor.tsx`
- Modify: `site/src/components/site/ProductMiniEditor.test.tsx`

- [ ] Replace the localStorage cart write in `handleAddToCart` with a call to the new `addToCart` helper (see Task C.2). The customisation object becomes a `attributes` array — line-item properties on the Cart line.
- [ ] Line-item attributes structure:
  ```
  [
    { key: "Text", value: "Olivia" },
    { key: "Primary colour", value: "Matte ink" },
    { key: "Secondary colour", value: "Blush" },
    { key: "Font", value: "Display serif" },
    { key: "Border width", value: "6 mm" },
    { key: "_design", value: JSON.stringify({ text, foreground, base, font, borderWidthMm }) }
  ]
  ```
  Keys prefixed with `_` are hidden in the customer-facing checkout but available to webhooks — we stash the structured payload there for studio fulfilment.
- [ ] Test asserts the cart helper is called with the correct attributes; replaces the old localStorage test.

### Task B.7: Smoke-test the catalog end-to-end

**Files:** none (verification).

- [ ] `npm run dev` — visit `/`, `/shop`, `/shop/olivia-circular-frame`. All should render from Shopify with zero visual regression. Run Playwright sanity-check.
- [ ] Verify the Big Letter Sign carousel still shows the six photographed shots (Shopify is now serving the image URLs).
- [ ] Confirm the 2D and 3D mini-editor still render — they don't depend on the catalog source at all, just the product fields.

**Definition of done for Phase B:** the storefront looks identical, but the catalog is read from Shopify; the Big Letter Sign is visible with all 6 photos; cart add is wired (writes happen in Phase C).

---

## Phase C — Cart migration (localStorage → Shopify Cart API)

Replace the `acx_cart_v1` localStorage payload with the Shopify Cart object. The cart lives on the server (Shopify); we hold its `cartId` in a cookie.

### Task C.1: Cart context + mutations

**Files:**
- Create: `site/src/lib/shopify/cart.ts`
- Create: `site/src/lib/shopify/CartProvider.tsx` (client component, React context)

- [ ] `cart.ts` exports `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, `getCart(cartId)` — all wrappers around Storefront API GraphQL mutations.
- [ ] `CartProvider`:
  - On mount, read `cart_id` cookie. If present, `getCart`. If absent or stale, `cartCreate` and persist the new id.
  - Exposes `cart`, `addLine(productVariantId, qty, attributes)`, `updateLine`, `removeLine`, `cartReady` (boolean), `cartCount`.
  - Listens for the existing `acx:cart-updated` CustomEvent from the editor so the cart-icon badge animates after a successful add (graceful fallback for any code paths still emitting it).

### Task C.2: `addToCart` helper that ProductMiniEditor + PDP CTA both call

**Files:**
- Modify: `site/src/components/site/ProductMiniEditor.tsx`
- Modify: `site/src/app/shop/[slug]/page.tsx` (the existing "Add to cart" button next to the price)

- [ ] Both call `addLine(variantId, 1, attributes)` from the cart context. The PDP top button uses an empty attributes array (buying as-shown); the editor button includes the customisation attributes.
- [ ] Confirmation state on each button — "Added to cart ✓" for 2.4s (already implemented in the editor).

### Task C.3: Cart drawer

**Files:**
- Create: `site/src/components/site/CartDrawer.tsx`
- Modify: `site/src/components/site/Header.tsx` — add a cart-count icon that opens the drawer.

- [ ] Slide-from-right drawer (Tailwind transition), opens on add-to-cart and on cart-icon click.
- [ ] Shows line items: thumbnail (Shopify image), title, qty stepper, attributes (customisation), price.
- [ ] Subtotal, "Free shipping over $150" progress bar (drives the existing PromoBar pattern with real cart subtotal — finally completing that promise).
- [ ] "Checkout" button → redirect to `cart.checkoutUrl` (Shopify-hosted checkout, branded per Phase A.7).
- [ ] "Continue shopping" button closes the drawer.

### Task C.4: Cart cookie persistence

**Files:**
- Modify: `site/src/lib/shopify/CartProvider.tsx`

- [ ] Cart ID stored in a `httpOnly: false` cookie scoped to the storefront domain so the SSR layout can also read it.
- [ ] 14-day TTL; Shopify carts expire after 10 days inactivity so a 14-day client TTL is safe.

**Definition of done for Phase C:** clicking "Add to cart" on a PDP, or "Add my custom piece" in the editor, pushes a real Shopify cart line. The cart-icon badge updates. Clicking the cart icon shows the drawer with line items. Clicking checkout takes the customer to Shopify's hosted checkout with the cart prefilled.

---

## Phase D — Checkout & order receipt

Shopify hosts the checkout. We do almost nothing here — but we DO need the post-checkout redirect to land back on our domain.

### Task D.1: Configure post-checkout redirect

**Files:** (no code — Shopify admin)

- [ ] Shopify admin → Settings → Checkout → Additional scripts → set the post-checkout `Order status URL redirect` to `https://acrylixco-production.up.railway.app/order/{order_id}` (using Shopify's template variables).
- [ ] Create `site/src/app/order/[id]/page.tsx` — server component that queries the order via the Storefront API's `Customer` query (authenticated) or via a one-time `OrderLookup` query; renders a brand-consistent "Thanks for your order, {first_name}!" page with the line items + customisation details.

### Task D.2: Order confirmation email theme

**Files:** (no code — Shopify admin)

- [ ] Shopify admin → Settings → Notifications → Order confirmation → edit HTML. Replace the default header with our terracotta promo bar + "Thanks from the Sydney studio." headline. Add a "What happens next" block matching the on-site HowItWorks copy ("Design in 3D / Confirm and order / Laser-cut and shipped").
- [ ] Include line-item attributes (customisation) in the email body so customers can verify their text/colours.

**Definition of done for Phase D:** a test order placed on staging lands on our `/order/[id]` page with the customisation visible, and the confirmation email matches the brand.

---

## Phase E — Webhooks & studio order mirror

We mirror Shopify orders into our own Postgres so the studio (the owner, for now) has a single queue to work from.

### Task E.1: Orders mirror schema

**Files:**
- Create: `site/src/db/schema/orders.ts`
- Create: `site/src/db/migrations/00XX_orders_mirror.sql`

- [ ] Tables:
  - `orders`: id (Shopify gid), order_number, customer_email, total_cents, currency, financial_status, fulfillment_status, created_at, raw_payload (JSONB — the full webhook for any field we forgot).
  - `order_lines`: id (Shopify gid), order_id (FK), product_handle, variant_id, title, qty, price_cents, attributes (JSONB — the line-item properties incl. customisation).
- [ ] Generate the migration with `npm run db:generate`. Apply locally and to prod via the existing Railway migration step on next deploy.

### Task E.2: Webhook receiver

**Files:**
- Create: `site/src/app/api/shopify/webhooks/route.ts`

- [ ] POST handler. Reads raw body, verifies HMAC against `SHOPIFY_WEBHOOK_SECRET` using `X-Shopify-Hmac-SHA256` header. Reject 401 on mismatch — never trust the body before verification.
- [ ] Dispatches on `X-Shopify-Topic`:
  - `orders/create` → upsert into `orders` + `order_lines`.
  - `orders/updated` → update existing row's `financial_status` / `fulfillment_status` / `raw_payload`.
  - `orders/fulfilled` → set `fulfillment_status='fulfilled'`.
  - `orders/cancelled` → set `financial_status='voided'`.
- [ ] Idempotent — uses `INSERT … ON CONFLICT (id) DO UPDATE`. Shopify retries failed webhooks; we must absorb duplicates.
- [ ] Always return 200 quickly (within 5s) after writing — Shopify times out otherwise.

### Task E.3: Register webhooks via Admin API

**Files:**
- Create: `site/scripts/register-webhooks.ts`

- [ ] One-off script that registers the four topics above against `https://acrylixco-production.up.railway.app/api/shopify/webhooks`.
- [ ] Run once after deploy. Verify in Shopify admin → Settings → Notifications → Webhooks that the four are listed.

### Task E.4: Studio queue read endpoint (skeleton for Phase 4 admin)

**Files:**
- Create: `site/src/app/api/admin/queue/route.ts`

- [ ] GET handler — returns the next N un-fulfilled orders, oldest first, with `order_lines.attributes` for the studio to read off and cut.
- [ ] Protected by a single-shared-secret header for now (`X-Admin-Token` matched against `process.env.ADMIN_TOKEN`). Real auth in Phase 4.
- [ ] Owner can `curl` this to see the queue until the admin dashboard ships.

**Definition of done for Phase E:** placing an order in Shopify writes a row to our `orders` table within 2 seconds. `/api/admin/queue` returns the new order with the customisation attributes visible.

---

## Phase F — Customer accounts & Auth.js retirement

Customers log in via Shopify; we retire Auth.js.

### Task F.1: Customer Account API integration

**Files:**
- Create: `site/src/lib/shopify/customer.ts`
- Create: `site/src/app/account/page.tsx` (account home: orders, addresses)
- Create: `site/src/app/account/login/page.tsx`
- Create: `site/src/app/account/orders/[id]/page.tsx`

- [ ] **✅ DECIDED (owner approved 2026-05-11)** — use the new Customer Accounts API (passwordless email magic-link, no signup friction, native to Shopify 2024+) vs. classic accounts (email + password). Recommendation: **Customer Accounts API**. It's the path Shopify is investing in and matches our brand (low-friction).
- [ ] OAuth-style redirect: `/account/login` → Shopify login page → callback at `/account/callback` with an access token → set as `customer_token` cookie.
- [ ] `customer.ts` wraps the four queries we need: customer profile, order history, order detail, addresses.

### Task F.2: Auth.js teardown

**Files:**
- Modify: `site/src/auth.ts` — remove
- Modify: `site/src/middleware.ts` — remove (replaces with `proxy.ts` empty stub per Next 16 deprecation)
- Modify: `site/src/app/api/auth/*` — remove
- Modify: `site/src/db/schema/auth.ts` — keep table definitions but stop using them (or drop in a follow-up migration once we're sure)

- [ ] Find every import of `next-auth`, `@auth/drizzle-adapter` — replace with calls to Shopify customer context.
- [ ] Update the e2e tests (`*.spec.ts`) that exercised login.

**Definition of done for Phase F:** `/account` is a brand-consistent page showing the logged-in customer's order history and customisation attributes per order. Auth.js is no longer in `package.json`.

---

## Phase G — Cleanup & memory updates

### Task G.1: Retire `db/schema/catalog.ts` (or freeze)

**Files:**
- **✅ DECIDED (owner approved 2026-05-11)** — delete vs. freeze (leave the schema, drop the rows). Recommendation: **freeze**. Keep the schema around for a release in case we need to fall back; drop the seed; drop the data-fetching helpers in `lib/catalog/queries.ts` after they've all been re-pointed at Shopify.

### Task G.2: Update memory

**Files:**
- Modify: `~/.claude/projects/-Users-mohamadhassan-Desktop-AcrylixCo/memory/project_state.md`
- Modify: `~/.claude/projects/-Users-mohamadhassan-Desktop-AcrylixCo/memory/reference_external.md`
- Possibly create: `~/.claude/projects/-Users-mohamadhassan-Desktop-AcrylixCo/memory/reference_shopify.md`

- [ ] Document: catalog now lives in Shopify; cart is Shopify Cart API; customer accounts are Shopify Customer Accounts API; auth is Shopify-backed (Auth.js retired).
- [ ] Note the four env vars and where they come from.
- [ ] Note webhook signing secret rotation procedure.

### Task G.3: Update Plan/build/README.md

**Files:**
- Modify: `Plan/build/README.md`

- [ ] Mark Phase 3 done with a link to this plan.
- [ ] Phase 4 (Admin) becomes the next planned phase — production-queue UI, customer order lookup, basic reports.

---

## Estimate

| Phase | Owner-effort | Agent-effort |
|---|---|---|
| A — Pre-flight | 1–2 hrs (account setup, payments approval wait time) | 0 |
| B — Catalog | 30 min (CSV upload OR run import script + spot-check) | 2 days |
| C — Cart | 0 (review + give thumbs-up) | 2 days |
| D — Checkout | 30 min (configure redirect + customise email template) | 0.5 day |
| E — Webhooks | 0 (review) | 1 day |
| F — Accounts | 0 (review) | 1.5 days |
| G — Cleanup | 0 (review) | 0.5 day |
| **Total** | **~3 hours of owner time** | **~7 working days agent-time** |

The "2 weeks" estimate from the 1-pager survives, with the caveat that Shopify Payments approval can take 24–48 hrs and serialises Phase A → B.

---

## Risks & open questions

- **Shopify Payments rejection.** Unlikely for an Australian business with an ABN, but if it happens we fall back to Stripe + Shopify ("third-party gateways" — fees go up slightly, Afterpay still works).
- **Migration of test orders / customers from the current Auth.js DB.** Currently zero customers — no migration. If we sit on Phase 3 for months and accumulate accounts, migration is more painful.
- **3D customizer's `/customize` route.** Unchanged. Phase 3 doesn't touch it. Long-term, we may want to persist designs server-side via Shopify Metaobjects — out of scope for this plan.
- **The catalog seed (`db/seed/catalog.ts`) is currently the canonical product list.** After Phase B, Shopify is canonical. The owner shouldn't edit the seed file anymore — they edit Shopify. Update memory to reflect this; the seed becomes "historical".
- **Image hosting.** During the migration we serve images from our `/products/big-letter-product/*` URLs. Shopify can host them too (free + CDN-cached) — after Phase B we can optionally migrate the image hosting too. Not required for v1.

---

## Self-review notes

- Every task has a file path or a clear non-code instruction.
- Decision points are flagged (5 total) — owner needs to choose before the relevant phase starts, not mid-flight.
- Auth retirement (Phase F) is intentionally last — it's the riskiest piece; we leave it until cart + checkout are proven.
- No phase requires the owner to write code.
- The `Big Letter Sign` product visibility is preserved end-to-end — the 6 photographs we just uploaded stay live.
