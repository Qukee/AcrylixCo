# Shopify vs. Custom-Build — 1-Pager

> **Date:** 2026-05-11
> **For:** Owner decision before Phase 3 commits.
> **Status:** Recommendation, not a plan. Implementation plan only written after the owner picks a path.

---

## The question

We're about to start Phase 3 (cart, checkout, accounts, payments, emails, shipping, tax). Two options on the table:

- **Stay custom.** Build everything in our current Next.js + Postgres + Auth.js stack.
- **Lean on Shopify.** Use Shopify's commerce backend for the heavy lifting (payments, inventory, shipping, tax, accounts).

This document picks the strongest path and shows what it looks like.

---

## Three viable paths at a glance

| | **A. Stay fully custom** | **B. Headless Shopify (recommended)** | **C. Full Shopify theme** |
|---|---|---|---|
| Frontend | Our current Next.js | Our current Next.js (unchanged) | Liquid theme on Shopify |
| Commerce backend | We build: Stripe + PayPal + Afterpay + Postgres `orders`, `cart`, `inventory`, `shipping`, `tax` | Shopify Storefront API + Shopify Payments | Shopify (everything) |
| 3D customizer | Works as-is | Works as-is | Hard — needs custom app or iframe |
| 2D mini-editor | Works as-is | Works as-is | Hard — same constraint |
| Editorial UX (hero, palette, motion) | Works as-is | Works as-is | Heavy rebuild in Liquid |
| Time to launch Phase 3 | ~6–8 weeks | ~2–4 weeks | ~3–5 weeks (lose customizer work) |
| Ongoing cost | $0 platform fee, ~$15/mo hosting | ~$79–105/mo Shopify Basic + 2.4% + $0.30 per AU card txn | Same as B |
| PCI / compliance | Our problem | Shopify's problem | Shopify's problem |
| Afterpay setup | We integrate | Out of the box via Shop Pay | Out of the box |
| AU GST / tax invoice | We implement | Shopify generates | Shopify generates |
| Australia Post live rates | We integrate via their API | Shopify Shipping or third-party app | Same as B |
| Custom-design persistence (text + colours + border) | Easy — our DB | Pass as line-item properties to Shopify | Same as B (slightly harder) |

---

## Recommended path: **B. Headless Shopify**

The shape of it:

```
Customer browser
       │
       ▼
┌──────────────────────────────────────┐
│  Our Next.js storefront              │   ◄── unchanged: hero, /shop, /shop/[slug],
│  (acrylixco-production.up.railway… ) │       /customize 3D, PDP 2D mini-editor,
│                                      │       palette, copy, brand
└──────────┬───────────────────────────┘
           │  Storefront API (GraphQL)
           ▼
┌──────────────────────────────────────┐
│  Shopify                             │   ◄── catalog (synced), cart, checkout,
│  • Storefront API                    │       payments (Stripe/PayPal/Afterpay/
│  • Shopify Payments                  │       Apple/Google Pay), inventory,
│  • Inventory                         │       customer accounts, order emails,
│  • Shipping zones (Aus Post)         │       AU GST + tax invoices, shipping
│  • Tax engine                        │       labels, refunds, chargebacks.
│  • Customer accounts                 │
│  • Order webhooks                    │
└──────────┬───────────────────────────┘
           │  Webhooks (orders, fulfilment)
           ▼
   Our Postgres (orders mirror, customisation payload, studio queue)
```

**The hard split:**

| Domain | Stays on our side | Moves to Shopify |
|---|---|---|
| Brand chrome (hero, header, footer, palette, motion, promo bar) | ✓ | |
| Product catalog (canonical source) | | ✓ (we sync from a CSV / small script) |
| Product detail pages | ✓ (rendered by Next.js from Shopify data) | |
| 3D customizer at `/customize` | ✓ | |
| 2D mini-editor on PDP | ✓ | |
| `acx_cart_v1` localStorage payload | Replaced by Shopify cart (Cart API) | ✓ |
| Customisation payload (text, foreground, base, font, border) | Sent as **line-item properties** to Shopify | ✓ |
| Checkout UI | | ✓ (Shopify-hosted, brandable) |
| Payments (Stripe, PayPal, Afterpay, Apple Pay) | | ✓ |
| Order confirmation email | | ✓ (we restyle the template) |
| Studio production queue (which pieces to cut today) | ✓ (consumed from Shopify webhooks) | |
| Customer accounts / order history | | ✓ (Auth.js retired) |

---

## What we gain by going B vs. A

1. **Real Afterpay in < 1 day** instead of ~2 weeks of integration + risk assessment + funding-source verification with Afterpay directly. (Afterpay APIs require merchant approval; Shopify already has it.)
2. **PCI / fraud / chargeback handling = zero engineering on our side.** Stripe Connect alone would need a few weeks of compliance work.
3. **AU GST + ABN tax invoicing built-in** — Shopify generates compliant invoices. Plan section 15 lists this as a hard requirement; doing it ourselves is non-trivial.
4. **Inventory and stock alerts** for free. Our current "5 spots left this week" is synthesized — Shopify would make it real.
5. **Order emails, returns workflow, refunds** all included.
6. **Australia Post live rates** via Shopify Shipping (or one of two well-supported apps).
7. **You stop being a bottleneck for ops** — discount codes, sale prices, inventory adjustments, refunds are all in the Shopify admin, no code change.

## What we give up

1. **Shopify pricing.** Basic plan is **AUD $43/mo**, then transaction fees on top. For our first year that's ~$500–700/mo at modest volume. A custom Stripe-only setup is ~$15/mo hosting + 1.75% AU card.
2. **Cart owns the order shape.** Customisation must fit in Shopify's "line-item properties" model (a key/value JSON blob — a good fit for us, but it caps at ~10kb per item).
3. **Checkout is Shopify-hosted.** Brandable but not fully designable — the URL is `checkout.shopify.com/...`. (Shopify Plus removes this; Plus is AUD $3.6k/mo and not yet justified.)
4. **Auth.js retired.** Customers log in through Shopify. Not a big deal — we never built much on Auth.js anyway.

## What we don't give up

- The 3D customizer at `/customize` — unchanged.
- The 2D mini-editor on the PDP — unchanged.
- The white + terracotta palette, hero video, motion graphics, promo bar, sale banner — unchanged.
- The product photography we just shot for the Big Letter line — same `/products/big-letter-product/*.png` files, just referenced from Shopify product records too.

---

## Risks worth flagging

- **Customer-data migration when we switch.** Right now we have zero real customers — migration is trivial. If we go A for a year and then switch later, every account is a manual re-create. *Do this now or commit to never doing it.*
- **Shopify's customisation model is line-item properties.** Each customised piece becomes a "Build Your Own" product in Shopify with the customisation as properties. If we later want to model variants by colour combination, it's harder.
- **Shopify Markets / multi-currency.** Out of scope until we sell internationally; flagging only because Shopify makes it trivial when we do.
- **Vendor lock-in.** Migrating off Shopify in 5 years is harder than migrating off Stripe + Postgres. We'd be tied to their product/order/customer shape via the API.

---

## The two-week version

If you pick B, the rough implementation plan looks like:

| Week | Work |
|---|---|
| 1 | Shopify store provisioned, Shopify Payments approved, Afterpay enabled. Catalog synced via CSV import (10 products → Shopify). `STOREFRONT_API_TOKEN` wired into Next.js. PDP "Add to cart" calls Shopify Cart API instead of localStorage. |
| 2 | Editor "Add my custom piece" sends customisation as line-item properties. Checkout redirect → Shopify checkout (custom-branded). Webhook receiver → mirrors orders into our Postgres for the studio queue. |
| 3 (overflow) | Order confirmation email restyled to brand. Aus Post live rates configured. GST set up. Test order end-to-end. |
| 4 (overflow) | Customer account integration (Shopify accounts replace Auth.js). Old `users` / `accounts` tables retired. Launch. |

Phase 3 in our existing plan was estimated 6–8 weeks. We cut it roughly in half and end up with a more reliable system.

---

## Decision needed

**Pick one — I'll then write the full implementation plan against it:**

1. **Go B.** Headless Shopify. Start the two-week plan above.
2. **Go A.** Stay fully custom. Continue the existing Phase 3 plan in `Plan/15-payments-and-checkout.md`.
3. **Sit on it.** Park Phase 3, finish the editorial polish on the storefront first.

---

## My recommendation, plainly

Go B. We're pre-revenue, the customisation model fits Shopify's line-item-properties pattern cleanly, and the existing Phase 3 plan has weeks of compliance work (PCI, Afterpay onboarding, GST invoicing) that disappear on Shopify. The custom UX that's actually our brand — 3D customizer, 2D editor, hero video, palette — all keeps working. The thing we lose (checkout-page brand control) is the least valuable surface in the funnel.

Sources:
- [Shopify Storefront API docs](https://shopify.dev/docs/api/storefront)
- [Shopify Cart line item properties (custom design pattern)](https://shopify.dev/docs/api/storefront/latest/objects/CartLine)
- [Shopify Payments Australia](https://help.shopify.com/en/manual/payments/shopify-payments/payment-methods/payment-methods-in-australia)
- [Afterpay × Shopify Payments AU](https://www.afterpay.com.au/business/integrations/shopify)
