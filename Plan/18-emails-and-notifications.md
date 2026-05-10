# Emails & Notifications

All transactional and lifecycle email customers receive from AcrylixCo.

## Required email flows

### Order confirmation

- Sent immediately on successful payment.
- Includes order number, line items, **rendered preview thumbnail** for any [custom designs](./13-design-persistence-and-handoff.md), shipping address, total, GST breakdown.
- Doubles as a **tax invoice** with our ABN (see [payments](./15-payments-and-checkout.md)).

### Shipping updates

- Order shipped confirmation with tracking link.
- Optional in-transit update.
- Delivered confirmation.

### Design proof approval (custom orders only)

- Sent for [custom designs](./13-design-persistence-and-handoff.md) before manufacturing begins.
- Customer reviews a high-resolution rendered preview and confirms.
- Approval / change-request actions inline.
- Owner sees the response in the [admin order viewer](./17-admin-dashboard.md).

### Abandoned cart

- Triggered when a cart sits unpurchased for N hours / days.
- Includes thumbnails of cart items (especially valuable for custom designs the customer spent time on).

### Back-in-stock

- Customer-subscribed per-product (see [product catalog](./03-product-catalog.md)).
- Sent when inventory returns above threshold.

### Saved-design recovery

- For guest-saved designs — capture the email and send a recovery link so they can return without creating an account.

### Account emails

- Account creation welcome.
- Password reset.
- Email change confirmation.

## Technical considerations

- **Transactional email service** (e.g. Resend, Postmark, SendGrid) — separate from any future marketing email tool.
- **Templates** authored as data, editable from the [admin dashboard](./17-admin-dashboard.md) without code changes (or at minimum, easily editable by the owner).
- **Attachments**: tax invoice PDF on order confirmation, rendered preview image on proof emails.
- **Idempotency**: webhook-driven sends (e.g. order paid → email) must not double-send on duplicate webhook delivery.
- **Unsubscribe** for non-essential emails (abandoned cart, back-in-stock); transactional emails (order, shipping) cannot be unsubscribed.

## Open questions

- Do we need **SMS notifications** for shipping in addition to / instead of email? Probably nice-to-have, not v1.
- Marketing email — is that handled here or punted to a separate platform (Klaviyo, Mailchimp)? Punt for v1.
- Multi-language emails — Australian customers shop in many languages; should the email match the customer's UI language? Out of scope for v1; English-only initially.

## Related

- [Customer accounts](./16-customer-accounts.md) — preferences
- [Design persistence & handoff](./13-design-persistence-and-handoff.md) — proof approval
- [Payments & checkout](./15-payments-and-checkout.md) — tax invoicing
- [Admin dashboard](./17-admin-dashboard.md) — template editing
- [Product catalog](./03-product-catalog.md) — back-in-stock
