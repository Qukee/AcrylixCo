'use client';

import { useCart } from './CartProvider';
import type { CartLine } from '@/lib/shopify/cart';

const FREE_SHIPPING_THRESHOLD_CENTS = 15000; // $150 AUD — matches PromoBar copy.

function formatPrice(amount: string, currency = 'AUD'): string {
  const cents = Math.round(parseFloat(amount) * 100);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, updateLine, removeLine } = useCart();

  if (!drawerOpen) return null;

  const lines = cart?.lines ?? [];
  const subtotalCents = cart ? Math.round(parseFloat(cart.cost.subtotalAmount.amount) * 100) : 0;
  const remainingToFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
  );
  const progressPct = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100),
  );

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className="flex-1 bg-ink-900/40 transition-opacity"
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">Your cart</p>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="grid h-8 w-8 place-items-center rounded-full text-ink-700 hover:bg-cream-50"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </header>

        {/* Free-shipping progress */}
        <div className="border-b border-cream-200 px-6 py-4">
          {remainingToFreeShipping > 0 ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700">
              {formatPrice((remainingToFreeShipping / 100).toFixed(2))} from free Express AU shipping
            </p>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-terracotta-700">
              ✓ Free Express AU shipping unlocked
            </p>
          )}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-100">
            <div
              className="h-full bg-terracotta-500 transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Line items */}
        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <p className="font-serif text-2xl italic text-ink-900">
                  Your cart&rsquo;s empty.
                </p>
                <p className="mt-2 text-sm text-ink-500">
                  Open the designer to build a custom piece, or browse the studio shelf.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-cream-200">
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  onUpdate={updateLine}
                  onRemove={removeLine}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-cream-200 px-6 py-5">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
            <span>Subtotal</span>
            <span className="font-serif text-xl normal-case tracking-normal text-ink-900">
              {cart ? formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode) : '$0'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-ink-500">
            Shipping and taxes calculated at checkout.
          </p>
          <a
            href={cart?.checkoutUrl ?? '#'}
            aria-disabled={!cart || lines.length === 0}
            className={`mt-4 grid w-full place-items-center rounded-full px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
              cart && lines.length > 0
                ? 'bg-terracotta-500 text-white hover:bg-terracotta-600'
                : 'pointer-events-none bg-cream-200 text-ink-500'
            }`}
          >
            Checkout
          </a>
          <button
            type="button"
            onClick={closeDrawer}
            className="mt-3 w-full rounded-full border border-cream-300 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ink-700 transition-colors hover:bg-cream-50"
          >
            Continue shopping
          </button>
        </footer>
      </aside>
    </div>
  );
}

interface CartLineItemProps {
  line: CartLine;
  onUpdate: (lineId: string, quantity: number) => Promise<void>;
  onRemove: (lineId: string) => Promise<void>;
}

function CartLineItem({ line, onUpdate, onRemove }: CartLineItemProps) {
  const img = line.merchandise.product.featuredImage;
  // Surface only customer-facing attributes (Shopify hides keys starting with
  // "_" from checkout, but the cart drawer renders straight from the API
  // response so we filter here too).
  const customerAttrs = line.attributes.filter((a) => !a.key.startsWith('_'));
  return (
    <li className="flex gap-4 px-6 py-5">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cream-50">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.altText ?? ''}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-serif text-base italic text-ink-900">
            {line.merchandise.product.title}
          </p>
          <p className="font-mono text-sm text-ink-900">
            {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
          </p>
        </div>
        {customerAttrs.length > 0 && (
          <dl className="mt-1 space-y-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
            {customerAttrs.map((a) => (
              <div key={a.key} className="flex gap-2">
                <dt>{a.key}:</dt>
                <dd className="text-ink-700">{a.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="inline-flex items-center overflow-hidden rounded-full border border-cream-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => onUpdate(line.id, Math.max(1, line.quantity - 1))}
              className="px-3 py-1 text-ink-700 hover:bg-cream-50"
            >
              −
            </button>
            <span className="min-w-[2ch] text-center font-mono text-xs tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => onUpdate(line.id, line.quantity + 1)}
              className="px-3 py-1 text-ink-700 hover:bg-cream-50"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(line.id)}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 hover:text-terracotta-600"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
