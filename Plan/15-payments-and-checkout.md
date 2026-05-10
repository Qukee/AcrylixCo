# Payments & Checkout

Australian market. The mix of payment methods below is required, not optional — particularly **Afterpay**, which is critical for the Australian gift / occasion-decor market.

## Required payment methods

- **Stripe** as the primary processor (handles cards: Visa, Mastercard, Amex)
- **PayPal**
- **Afterpay** (critical for the Australian market)
- **Apple Pay** and **Google Pay** (via Stripe / native wallets)

## Checkout requirements

- **Guest checkout** supported (no forced account creation).
- **Saved addresses** for logged-in customers.
- **Order confirmation emails** (see [emails](./18-emails-and-notifications.md)).
- For [custom designs](./13-design-persistence-and-handoff.md): the cart line item carries a thumbnail so the customer can verify what they're ordering before paying.

## Shipping

- **Australia Post integration** for live shipping calculation.
- Domestic-first; international shipping out of scope for v1 unless specified later.
- Per-product weight/dimensions feed the calculator.
- Customers see the shipping cost before paying.

## Tax & invoicing

- **GST handling** — Australian GST applied per Australian tax rules.
- **Australian tax invoicing** — order confirmation doubles as a tax invoice with our ABN, GST breakdown, and the required line items.
- Tax displayed inclusive in customer-facing prices, broken out at checkout.

## Architecture notes

- Stripe is the primary processor; PayPal and Afterpay are alternative checkout flows. Avoid double-coupling them — each payment method has its own confirmation pathway.
- Webhooks for Stripe / PayPal / Afterpay must be **idempotent** — duplicate webhook delivery cannot create duplicate orders.
- Failed payments must surface clear customer messaging without losing the cart contents.

## Open questions

- Do we need **subscription / recurring payment** support at v1? (Probably no — every piece is custom.)
- Are there **B2B / corporate** invoicing flows we need (e.g. NET 30 terms for a corporate gifting client)? Out of scope for v1 unless specified.
- Currency — AUD only at v1, or should we plan multi-currency from the start? Leaning AUD-only for simplicity.

## Related

- [Customer accounts](./16-customer-accounts.md) — saved addresses, order history
- [Emails & notifications](./18-emails-and-notifications.md) — order confirmations, tax invoices
- [Dimensioning & pricing](./12-dimensioning-and-pricing.md) — pricing inputs
- [Admin dashboard](./17-admin-dashboard.md) — order management
