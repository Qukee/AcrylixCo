# Real-World Dimensioning & Live Pricing

The customer is buying a physical object at a real size for a real price. The designer has to make both visible and immediate.

## Sizes

All sizes are shown in **centimetres**. Size presets:

| Preset | Width |
| --- | --- |
| Small | ~20 cm |
| Medium | ~35 cm |
| Large | ~50 cm |
| Extra Large | 60 cm+ |

Customers pick a preset; advanced users can fine-tune within the bounds of the chosen template.

## Live price recalculation

The price updates **as the customer makes any choice** that affects cost:

- Size
- Layer count (adding an [accent layer](./06-layer-system.md))
- Finish (mirror, glitter, glow-in-the-dark cost more than matte)
- Font complexity (intricate scripts may need slower laser passes)
- Number of decorative elements
- Stand options (no stand / clear stand / branded stand)

## Price breakdown visibility

A **tap or hover on the price** reveals the breakdown — customers should understand *what drives* the cost, not just see the total.

This builds trust and reduces support questions ("why is this one $X but the other $Y?").

## Pricing model considerations

The pricing engine needs to express:

- **Material cost** per layer (varies by material — see [material library](./08-material-finish-library.md))
- **Area-based cost** — bigger layers cost more (sheet usage)
- **Cut complexity** — longer cut paths cost more (laser time)
- **Layer count** — more layers means more bonding labor
- **Stand / mounting hardware** — discrete add-ons
- **Per-template floor price** — minimum price below which we won't make a piece (covers fixed setup cost)

## Currency & tax

- Prices in **AUD**.
- **GST inclusive** by default in customer-facing UI.
- Tax breakdown surfaced at checkout (see [payments](./15-payments-and-checkout.md)).

## Open questions

- Should we expose **fine-grained size control** (e.g. drag to resize within bounds) or only the four presets? Presets are simpler; bounded resize is more flexible.
- Cut-time pricing requires us to **estimate the laser path length** at design time — is that feasible client-side, or does it need a server-side estimator?
- Volume discounts for **corporate orders** — needed at v1 or later?

## Related

- [Material & finish library](./08-material-finish-library.md) — per-material cost factors
- [Layer system](./06-layer-system.md) — per-layer cost
- [Payments & checkout](./15-payments-and-checkout.md) — GST and AUD
- [Admin dashboard](./17-admin-dashboard.md) — pricing knobs
