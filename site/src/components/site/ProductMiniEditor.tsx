'use client';

import { useState } from 'react';
import { Container } from './Container';
import { Button } from './Button';
import type { ProductSummary } from '@/lib/catalog/queries';

export interface ProductMiniEditorProps {
  product: ProductSummary;
  categories: { slug: string; name: string }[];
}

interface Swatch {
  hex: string;
  label: string;
}

// Foreground — the top acrylic layer, typically a deeper saturated colour
// because it carries the letterform itself.
const FOREGROUND_SWATCHES: Swatch[] = [
  { hex: '#2c2920', label: 'Matte ink' },
  { hex: '#ffffff', label: 'Matte white' },
  { hex: '#b77b5e', label: 'Terracotta' },
  { hex: '#9c6549', label: 'Rust' },
  { hex: '#a99868', label: 'Gold' },
  { hex: '#6f8068', label: 'Sage' },
  { hex: '#3a4f6b', label: 'Navy' },
  { hex: '#6e2a3c', label: 'Wine' },
];

// Base — the offset-outline back layer; usually a lighter or contrasting
// colour so it reads as a halo around the foreground letters.
const BASE_SWATCHES: Swatch[] = [
  { hex: '#f5e1d2', label: 'Blush' },
  { hex: '#faf6ec', label: 'Ivory' },
  { hex: '#ece5d3', label: 'Sand' },
  { hex: '#ffffff', label: 'White' },
  { hex: '#2c2920', label: 'Ink' },
  { hex: '#eac4ad', label: 'Peach' },
  { hex: '#cdd6c2', label: 'Sage' },
  { hex: '#dcd3bd', label: 'Cream' },
];

const CART_KEY = 'acx_cart_v1';

export function ProductMiniEditor({ product }: ProductMiniEditorProps) {
  const defaultText = extractDefaultText(product.name);
  const defaultForeground = FOREGROUND_SWATCHES[0]!.hex;
  const defaultBase = BASE_SWATCHES[0]!.hex;

  const [text, setText] = useState(defaultText);
  const [foreground, setForeground] = useState(defaultForeground);
  const [base, setBase] = useState(defaultBase);
  const [added, setAdded] = useState(false);

  const reset = () => {
    setText(defaultText);
    setForeground(defaultForeground);
    setBase(defaultBase);
    setAdded(false);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      priceCents: product.priceCents,
      customization: { text: text || defaultText, foreground, base },
      qty: 1,
    });
    setAdded(true);
    // Revert the confirmation copy after a moment so the next click reads as
    // a fresh action.
    window.setTimeout(() => setAdded(false), 2400);
  };

  // Two-layer text: the back layer is rendered with a thick stroke in the
  // base colour (this becomes the "offset-outline" acrylic back layer that
  // peeks out from behind the foreground), then the foreground letters
  // sit on top.
  const fontSize = textFontSize(text);
  const ariaLabel = `2D preview: "${text || defaultText}" — foreground ${describeColour(
    foreground,
    FOREGROUND_SWATCHES,
  )}, base ${describeColour(base, BASE_SWATCHES)}`;

  return (
    <section className="border-y border-cream-200 bg-cream-50">
      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-terracotta-700">
              Make it yours
            </p>
            <h2 className="mt-3 font-serif text-3xl italic md:text-4xl">
              See your name on it — instantly.
            </h2>
            <p className="mt-4 max-w-md text-ink-700 md:text-lg">
              Type your text, try a colour, then add it straight to cart — or
              open the full 3D designer to play with finishes.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="mini-editor-text"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500"
                >
                  Your text
                </label>
                <input
                  id="mini-editor-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={20}
                  placeholder="Your name"
                  className="mt-2 w-full max-w-sm rounded-md border border-cream-200 bg-white px-4 py-2.5 font-serif text-lg italic text-ink-900 placeholder:text-ink-500 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                />
              </div>

              <SwatchRow
                label="Foreground colour"
                swatches={FOREGROUND_SWATCHES}
                selected={foreground}
                onSelect={setForeground}
              />

              <SwatchRow
                label="Base colour"
                swatches={BASE_SWATCHES}
                selected={base}
                onSelect={setBase}
              />

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button onClick={handleAddToCart} variant="primary" size="md" type="button">
                  {added ? 'Added to cart ✓' : 'Add my custom piece'}
                </Button>
                <Button href="/customize" variant="ghost" size="md">
                  Customize in 3D →
                </Button>
                <button
                  type="button"
                  onClick={reset}
                  className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500 hover:text-ink-900"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="grid aspect-[4/3] w-full max-w-[480px] place-items-center">
              <svg
                role="img"
                aria-label={ariaLabel}
                viewBox="0 0 400 240"
                className="block h-auto w-full"
                style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.10))' }}
              >
                {/* Back acrylic layer — same letters, thick stroke = the
                    offset-outline halo around the foreground. */}
                <text
                  x={200}
                  y={120}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  fontSize={fontSize}
                  fill={base}
                  stroke={base}
                  strokeWidth={18}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {text || defaultText}
                </text>
                {/* Foreground acrylic layer */}
                <text
                  x={200}
                  y={120}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  fontSize={fontSize}
                  fill={foreground}
                >
                  {text || defaultText}
                </text>
              </svg>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              2D preview · {product.materialsSummary.split(',')[0]?.trim()}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

interface SwatchRowProps {
  label: string;
  swatches: Swatch[];
  selected: string;
  onSelect: (hex: string) => void;
}

function SwatchRow({ label, swatches, selected, onSelect }: SwatchRowProps) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        {swatches.map((s) => {
          const isSelected = s.hex.toLowerCase() === selected.toLowerCase();
          return (
            <button
              key={s.hex}
              type="button"
              aria-label={`${label}: ${s.label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(s.hex)}
              title={s.label}
              className={`h-8 w-8 rounded-full border border-cream-300 transition-shadow ${
                isSelected
                  ? 'ring-2 ring-terracotta-500 ring-offset-2 ring-offset-cream-50'
                  : 'hover:ring-1 hover:ring-cream-400'
              }`}
              style={{ backgroundColor: s.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}

function extractDefaultText(productName: string): string {
  // Matches both straight and smart double quotes used in the seed catalog.
  const m = productName.match(/[""]([^""]+)[""]/);
  return m && m[1] ? m[1] : 'Your name';
}

// Scale the font down for longer strings so a single line always fits the
// 400-wide canvas with margin.
function textFontSize(text: string): number {
  const len = Math.max((text || 'Your name').length, 3);
  return Math.round(Math.min(120, Math.max(40, 520 / len)));
}

function describeColour(hex: string, swatches: Swatch[]): string {
  const match = swatches.find((s) => s.hex.toLowerCase() === hex.toLowerCase());
  return match ? match.label.toLowerCase() : hex;
}

interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  priceCents: number;
  customization: { text: string; foreground: string; base: string };
  qty: number;
  addedAt: number;
}

interface Cart {
  items: CartItem[];
  updatedAt: number;
}

function addToCart(item: Omit<CartItem, 'id' | 'addedAt'>): void {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(CART_KEY);
  let cart: Cart = { items: [], updatedAt: 0 };
  if (raw) {
    try {
      cart = JSON.parse(raw) as Cart;
    } catch {
      // Corrupt blob — start fresh rather than blow up the page.
      cart = { items: [], updatedAt: 0 };
    }
  }
  cart.items.push({
    ...item,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    addedAt: Date.now(),
  });
  cart.updatedAt = Date.now();
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Fire a custom event so the header / cart drawer (Phase 3) can react.
  window.dispatchEvent(new CustomEvent('acx:cart-updated', { detail: cart }));
}
