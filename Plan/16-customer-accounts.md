# Customer Accounts

A customer-facing account surface. Light, focused on what an AcrylixCo customer actually does — not a full SaaS profile system.

## Account-holder capabilities

- **Order history** — all past orders with status, dates, line items.
- **Per-order detail** — including a **rendered preview thumbnail** for [custom designs](./13-design-persistence-and-handoff.md).
- **Saved custom designs** — drafts and previously-ordered designs, openable in the [designer](./04-designer-philosophy.md).
- **Saved addresses** for faster checkout.
- **Wishlist / favorites** for [catalog products](./03-product-catalog.md).
- **Back-in-stock subscriptions** management.
- **Profile**: name, email, password, communication preferences.

## Account creation

- Optional — guest checkout is supported (see [payments](./15-payments-and-checkout.md)).
- Easy upgrade from guest to account post-checkout (we already have the email).
- Email + password and (ideally) social login (Google / Apple) for friction reduction.

## Saved designs

A customer's saved designs are first-class:

- Listed with thumbnails.
- Editable — re-enter the [designer](./04-designer-philosophy.md) and continue.
- "Order again" — clone a previously-ordered design, optionally tweak it, add to cart.
- Versioned per the [persistence spec](./13-design-persistence-and-handoff.md) — older designs remain renderable even if the schema evolves.

## Privacy & data handling

- Australian Privacy Principles compliance.
- Clear data export and deletion paths.
- Marketing communications opt-in (not opt-out).

## Open questions

- Do we want **guest design saving** (capture email, send a recovery link, no password)? Likely yes — lowers friction without forcing account creation.
- Should accounts support **multiple shipping addresses** with a default flag? Likely yes for v1.
- Loyalty / repeat-customer perks — out of scope for v1 unless specified.

## Related

- [Payments & checkout](./15-payments-and-checkout.md) — saved addresses, guest checkout
- [Design persistence & handoff](./13-design-persistence-and-handoff.md) — saved designs
- [Product catalog](./03-product-catalog.md) — wishlist
- [Emails & notifications](./18-emails-and-notifications.md) — comms preferences
