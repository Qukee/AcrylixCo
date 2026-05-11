'use client';

import { useState } from 'react';
import { Container } from './Container';
import { Button } from './Button';
import { MiniScene3DClient } from './MiniScene3DClient';
import type { ProductSummary } from '@/lib/catalog/queries';

type PreviewMode = '2d' | '3d';

// Identifies which silhouette / composition the editor renders. Defaults to
// 'plaque' (single-line text); 'big-letter' renders the user's name inside
// the counter of a large serif initial — matches the Big Letter product line.
export type EditorTemplate = 'plaque' | 'big-letter';

export interface ProductMiniEditorProps {
  product: ProductSummary;
  categories: { slug: string; name: string }[];
  template?: EditorTemplate;
}

interface Swatch {
  hex: string;
  label: string;
}

interface FontOption {
  id: string;
  label: string;
  family: string;
  italic?: boolean;
  // Local .ttf URL the 3D engine parses to build glyph geometry. Every font
  // exposed to the shopper needs one so the 2D and 3D previews stay in sync.
  url: string;
}

const BORDER_MIN = 2;
const BORDER_MAX = 14;
const BORDER_DEFAULT = 6;

// Primary (foreground) — the top acrylic layer that carries the letterform.
const PRIMARY_SWATCHES: Swatch[] = [
  { hex: '#2c2920', label: 'Matte ink' },
  { hex: '#ffffff', label: 'Matte white' },
  { hex: '#b77b5e', label: 'Terracotta' },
  { hex: '#9c6549', label: 'Rust' },
  { hex: '#a99868', label: 'Gold' },
  { hex: '#6f8068', label: 'Sage' },
  { hex: '#3a4f6b', label: 'Navy' },
  { hex: '#6e2a3c', label: 'Wine' },
];

// Secondary (base) — the offset-outline back layer that haloes the letters.
const SECONDARY_SWATCHES: Swatch[] = [
  { hex: '#f5e1d2', label: 'Blush' },
  { hex: '#faf6ec', label: 'Ivory' },
  { hex: '#ece5d3', label: 'Sand' },
  { hex: '#ffffff', label: 'White' },
  { hex: '#2c2920', label: 'Ink' },
  { hex: '#eac4ad', label: 'Peach' },
  { hex: '#cdd6c2', label: 'Sage' },
  { hex: '#dcd3bd', label: 'Cream' },
];

// Every option ships a local .ttf so the 3D engine can build its geometry
// from the same source the 2D preview renders via @font-face. Fraunces /
// Bricolage (the site-wide Google Fonts) live as web-font CSS only, so
// they're deliberately excluded — exposing them would mean the 3D mode
// silently fell back to a different typeface.
const FONT_OPTIONS: FontOption[] = [
  {
    id: 'display',
    label: 'Display serif',
    family: 'AcxDMSerif, Georgia, serif',
    url: '/fonts/DMSerifDisplay-Regular.ttf',
  },
  {
    id: 'bold-sans',
    label: 'Bold sans',
    family: 'AcxAnton, Impact, sans-serif',
    url: '/fonts/Anton-Regular.ttf',
  },
  {
    id: 'script',
    label: 'Flowing script',
    family: 'AcxGreatVibes, cursive',
    italic: true,
    url: '/fonts/GreatVibes-Regular.ttf',
  },
];

const CART_KEY = 'acx_cart_v1';

export function ProductMiniEditor({ product, template = 'plaque' }: ProductMiniEditorProps) {
  const defaultText = extractDefaultText(product.name);
  const defaultPrimary = PRIMARY_SWATCHES[0]!.hex;
  const defaultSecondary = SECONDARY_SWATCHES[0]!.hex;
  const defaultFont = FONT_OPTIONS[0]!.id;

  const [text, setText] = useState(defaultText);
  const [primary, setPrimary] = useState(defaultPrimary);
  const [secondary, setSecondary] = useState(defaultSecondary);
  const [fontId, setFontId] = useState(defaultFont);
  const [borderWidth, setBorderWidth] = useState(BORDER_DEFAULT);
  const [open, setOpen] = useState<'primary' | 'secondary' | null>(null);
  const [added, setAdded] = useState(false);
  const [mode, setMode] = useState<PreviewMode>('2d');

  const reset = () => {
    setText(defaultText);
    setPrimary(defaultPrimary);
    setSecondary(defaultSecondary);
    setFontId(defaultFont);
    setBorderWidth(BORDER_DEFAULT);
    setOpen(null);
    setAdded(false);
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      priceCents: product.priceCents,
      customization: {
        text: text || defaultText,
        foreground: primary,
        base: secondary,
        font: fontId,
        borderWidthMm: borderWidth,
      },
      qty: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2400);
  };

  const font = FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0]!;
  const primaryLabel =
    PRIMARY_SWATCHES.find((s) => s.hex.toLowerCase() === primary.toLowerCase())?.label ?? primary;
  const secondaryLabel =
    SECONDARY_SWATCHES.find((s) => s.hex.toLowerCase() === secondary.toLowerCase())?.label ??
    secondary;

  const fontSize = textFontSize(text);
  const ariaLabel = `Preview: "${text || defaultText}" — primary ${primaryLabel.toLowerCase()}, secondary ${secondaryLabel.toLowerCase()}`;

  return (
    <section className="border-y border-cream-200 bg-white">
      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start md:gap-16">
          {/* Controls column */}
          <div>
            <div>
              <p className="font-serif text-3xl italic md:text-4xl">Make it yours</p>
              <Squiggle />
            </div>

            <div className="mt-10 space-y-7">
              {/* Your text + font picker */}
              <Row label="Your text">
                <div className="flex w-full items-center gap-3">
                  <input
                    id="mini-editor-text"
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={20}
                    placeholder="Your name"
                    aria-label="Your text"
                    className="min-w-0 flex-1 bg-transparent font-serif text-2xl italic text-ink-900 placeholder:text-ink-500 focus:outline-none"
                  />
                  <FontSelect value={fontId} onChange={setFontId} />
                </div>
              </Row>

              {/* Primary colour */}
              <Row label="Primary colour">
                <ColourPicker
                  id="primary"
                  label={primaryLabel}
                  hex={primary}
                  swatches={PRIMARY_SWATCHES}
                  isOpen={open === 'primary'}
                  onToggle={() => setOpen(open === 'primary' ? null : 'primary')}
                  onSelect={(hex) => {
                    setPrimary(hex);
                    setOpen(null);
                  }}
                />
              </Row>

              {/* Secondary colour */}
              <Row label="Secondary colour">
                <ColourPicker
                  id="secondary"
                  label={secondaryLabel}
                  hex={secondary}
                  swatches={SECONDARY_SWATCHES}
                  isOpen={open === 'secondary'}
                  onToggle={() => setOpen(open === 'secondary' ? null : 'secondary')}
                  onSelect={(hex) => {
                    setSecondary(hex);
                    setOpen(null);
                  }}
                />
              </Row>

              {/* Dimensions — border width slider */}
              <Row label="Dimensions">
                <div className="flex w-full items-center gap-4">
                  <span className="font-serif text-xl italic text-ink-900">
                    Border width
                  </span>
                  <input
                    type="range"
                    min={BORDER_MIN}
                    max={BORDER_MAX}
                    step={1}
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))}
                    aria-label="Border width in millimetres"
                    className="flex-1 accent-terracotta-500"
                  />
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-700 tabular-nums">
                    {borderWidth} mm
                  </span>
                </div>
              </Row>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
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

          {/* Preview column */}
          <div>
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-ink-700/70 bg-white">
              <p className="absolute left-5 top-4 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {mode === '3d' ? '3D preview' : '2D preview'}
              </p>
              <ModeToggle mode={mode} onChange={setMode} />
              {mode === '2d' ? (
                <div className="absolute inset-0 grid place-items-center px-6">
                  {template === 'big-letter' ? (
                    <BigLetterPreview2D
                      text={text || defaultText}
                      primary={primary}
                      secondary={secondary}
                      borderWidth={borderWidth}
                      ariaLabel={ariaLabel}
                    />
                  ) : (
                    <PlaquePreview2D
                      text={text || defaultText}
                      primary={primary}
                      secondary={secondary}
                      borderWidth={borderWidth}
                      font={font}
                      fontSize={fontSize}
                      ariaLabel={ariaLabel}
                    />
                  )}
                </div>
              ) : (
                <MiniScene3DClient
                  text={text || defaultText}
                  primaryHex={primary}
                  secondaryHex={secondary}
                  fontUrl={font.url}
                  borderWidthMm={borderWidth}
                  template={template}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function Row({ label, children }: RowProps) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">{label}</p>
      <div className="mt-2 flex min-h-[36px] items-center gap-3 border-b border-ink-900/80 pb-2">
        {children}
      </div>
    </div>
  );
}

interface FontSelectProps {
  value: string;
  onChange: (id: string) => void;
}

function FontSelect({ value, onChange }: FontSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Font"
        className="cursor-pointer appearance-none bg-transparent pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700 focus:outline-none"
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-ink-700"
      >
        ↓
      </span>
    </div>
  );
}

interface ColourPickerProps {
  id: string;
  label: string;
  hex: string;
  swatches: Swatch[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (hex: string) => void;
}

function ColourPicker({
  id,
  label,
  hex,
  swatches,
  isOpen,
  onToggle,
  onSelect,
}: ColourPickerProps) {
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-swatches`}
        className="flex w-full items-center justify-between gap-3"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-5 w-5 rounded-full border border-cream-300"
            style={{ backgroundColor: hex }}
          />
          <span className="font-serif text-xl italic text-ink-900">{label}</span>
        </span>
        <span
          aria-hidden
          className={`transition-transform ${isOpen ? 'rotate-180' : ''} text-ink-700`}
        >
          ↓
        </span>
      </button>
      {isOpen && (
        <ul
          id={`${id}-swatches`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-3 flex flex-wrap gap-3 rounded-md border border-cream-200 bg-white p-4 shadow-md"
        >
          {swatches.map((s) => {
            const selected = s.hex.toLowerCase() === hex.toLowerCase();
            return (
              <li key={s.hex}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onSelect(s.hex)}
                  title={s.label}
                  className={`grid h-9 w-9 place-items-center rounded-full border border-cream-300 transition-shadow ${
                    selected
                      ? 'ring-2 ring-terracotta-500 ring-offset-2 ring-offset-white'
                      : 'hover:ring-1 hover:ring-cream-400'
                  }`}
                  style={{ backgroundColor: s.hex }}
                >
                  <span className="sr-only">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Squiggle() {
  // Hand-drawn wavy underline beneath the section heading, terracotta-500.
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 22"
      width="200"
      height="18"
      className="mt-2 block text-terracotta-500"
    >
      <path
        d="M2 12 C 22 2, 42 22, 62 12 S 102 2, 122 12 S 162 22, 182 12 S 222 2, 238 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PlaquePreview2DProps {
  text: string;
  primary: string;
  secondary: string;
  borderWidth: number;
  font: FontOption;
  fontSize: number;
  ariaLabel: string;
}

function PlaquePreview2D({
  text,
  primary,
  secondary,
  borderWidth,
  font,
  fontSize,
  ariaLabel,
}: PlaquePreview2DProps) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 400 200"
      className="block h-auto w-full max-w-[420px]"
      style={{ filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.12))' }}
    >
      <text
        x={200}
        y={100}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={font.family}
        fontStyle={font.italic ? 'italic' : 'normal'}
        fontSize={fontSize}
        fill={secondary}
        stroke={secondary}
        strokeWidth={borderWidth * 3}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {text}
      </text>
      <text
        x={200}
        y={100}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={font.family}
        fontStyle={font.italic ? 'italic' : 'normal'}
        fontSize={fontSize}
        fill={primary}
      >
        {text}
      </text>
    </svg>
  );
}

interface BigLetterPreview2DProps {
  text: string;
  primary: string;
  secondary: string;
  borderWidth: number;
  ariaLabel: string;
}

// Big-letter template: a serif initial sized to dominate the canvas, with
// the full name overlaid into the counter. Mirrors the look of the
// photographed product line — secondary colour is the initial (back layer),
// primary colour is the name (top layer).
function BigLetterPreview2D({
  text,
  primary,
  secondary,
  borderWidth,
  ariaLabel,
}: BigLetterPreview2DProps) {
  const firstLetter = (text.trim().charAt(0) || 'A').toUpperCase();
  // Name fontSize scales down for long strings so it stays inside the
  // initial's counter.
  const nameLen = Math.max(text.trim().length, 3);
  const nameSize = Math.round(Math.min(58, Math.max(28, 240 / nameLen)));
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 400 320"
      className="block h-auto w-full max-w-[420px]"
      style={{ filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.12))' }}
    >
      {/* Back layer — large serif initial with halo stroke = base acrylic. */}
      <text
        x={200}
        y={170}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="AcxDMSerif, Georgia, serif"
        fontSize={300}
        fill={secondary}
        stroke={secondary}
        strokeWidth={borderWidth * 2.5}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {firstLetter}
      </text>
      {/* Front layer — full name inside the counter. */}
      <text
        x={200}
        y={175}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="AcxDMSerif, Georgia, serif"
        fontSize={nameSize}
        fill={primary}
      >
        {text}
      </text>
    </svg>
  );
}

interface ModeToggleProps {
  mode: PreviewMode;
  onChange: (m: PreviewMode) => void;
}

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Preview mode"
      className="absolute right-4 top-3 z-10 inline-flex overflow-hidden rounded-full border border-cream-300 bg-white shadow-sm"
    >
      {(['2d', '3d'] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${m.toUpperCase()} preview`}
            onClick={() => onChange(m)}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
              active
                ? 'bg-terracotta-500 text-white'
                : 'text-ink-700 hover:bg-cream-50'
            }`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}

function extractDefaultText(productName: string): string {
  const m = productName.match(/[""]([^""]+)[""]/);
  return m && m[1] ? m[1] : 'Your name';
}

function textFontSize(text: string): number {
  const len = Math.max((text || 'Your name').length, 3);
  return Math.round(Math.min(110, Math.max(38, 480 / len)));
}

interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  priceCents: number;
  customization: {
    text: string;
    foreground: string;
    base: string;
    font: string;
    borderWidthMm: number;
  };
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
  window.dispatchEvent(new CustomEvent('acx:cart-updated', { detail: cart }));
}
