'use client';

import { useEffect, useState } from 'react';
import { Container } from './Container';
import { Button } from './Button';
import { MiniScene3DClient } from './MiniScene3DClient';
import { useCart } from '@/components/cart/CartProvider';
import type { ProductSummary } from '@/lib/catalog/queries';

type PreviewMode = '2d' | '3d';

// Identifies which silhouette / composition the editor renders. Defaults to
// 'plaque' (single-line text); 'big-letter' renders the user's name inside
// the counter of a large serif initial; 'coaster' is a round disc with the
// name centred — matches the round-plaque / coaster product line.
export type EditorTemplate = 'plaque' | 'big-letter' | 'coaster';

export interface ProductMiniEditorProps {
  product: ProductSummary;
  categories: { slug: string; name: string }[];
  template?: EditorTemplate;
  variantId?: string;
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

export function ProductMiniEditor({
  product,
  template = 'plaque',
  variantId,
}: ProductMiniEditorProps) {
  const { addLine, openDrawer } = useCart();
  // Template-specific fallback so the 3D preview lands on a flattering letter.
  // Big-letter banks on a counter glyph (O/A/D…) so the name reads inside the
  // initial — 'Olivia' is the photographed demo. Coasters get a short Eid word
  // that fits a 180mm disc at the default font size.
  const fallback =
    template === 'big-letter'
      ? 'Olivia'
      : template === 'coaster'
        ? 'Eid'
        : 'Your name';
  const defaultText = extractDefaultText(product.name, fallback);
  const defaultPrimary = PRIMARY_SWATCHES[0]!.hex;
  const defaultSecondary = SECONDARY_SWATCHES[0]!.hex;
  const defaultFont = FONT_OPTIONS[0]!.id;

  const [text, setText] = useState(defaultText);
  const [primary, setPrimary] = useState(defaultPrimary);
  const [secondary, setSecondary] = useState(defaultSecondary);
  const [fontId, setFontId] = useState(defaultFont);
  const [borderWidth, setBorderWidth] = useState(BORDER_DEFAULT);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<'primary' | 'secondary' | null>(null);
  const [added, setAdded] = useState(false);
  // 3D leads — shoppers see the real acrylic depth/finish up front; the 2D
  // toggle stays available for low-power devices or accessibility.
  const [mode, setMode] = useState<PreviewMode>('3d');

  const reset = () => {
    setText(defaultText);
    setPrimary(defaultPrimary);
    setSecondary(defaultSecondary);
    setFontId(defaultFont);
    setBorderWidth(BORDER_DEFAULT);
    setQty(1);
    setOpen(null);
    setAdded(false);
  };

  const handleAddToCart = async () => {
    if (!variantId) {
      // No Shopify variant wired (older pages or tests) — silently no-op.
      return;
    }
    const customisation = {
      text: text || defaultText,
      foreground: primary,
      base: secondary,
      font: fontId,
      borderWidthMm: borderWidth,
    };
    const primaryLabelHuman =
      PRIMARY_SWATCHES.find((s) => s.hex.toLowerCase() === primary.toLowerCase())?.label ??
      primary;
    const secondaryLabelHuman =
      SECONDARY_SWATCHES.find((s) => s.hex.toLowerCase() === secondary.toLowerCase())?.label ??
      secondary;
    const fontLabel = FONT_OPTIONS.find((f) => f.id === fontId)?.label ?? fontId;
    // Human-friendly keys appear in the Shopify-hosted checkout + customer
    // confirmation email; the `_design` key is hidden (Shopify drops keys
    // prefixed with `_` from customer-facing surfaces) and carries the
    // structured payload that the studio production queue will consume.
    const attributes = [
      { key: 'Text', value: customisation.text },
      { key: 'Primary colour', value: primaryLabelHuman },
      { key: 'Secondary colour', value: secondaryLabelHuman },
      { key: 'Font', value: fontLabel },
      { key: 'Border width', value: `${customisation.borderWidthMm} mm` },
      { key: '_design', value: JSON.stringify(customisation) },
    ];
    try {
      await addLine(variantId, qty, attributes);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2400);
      openDrawer();
    } catch (err) {
      console.error('add custom piece failed', err);
    }
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
    <section id="customise" className="scroll-mt-24 border-y border-cream-200 bg-white">
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

              {/* Dimensions — border width slider. Hidden for coaster
                  products: the disc rim is fixed and only colours / text /
                  font are editable. */}
              {template !== 'coaster' && (
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
              )}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <QuantityStepper value={qty} onChange={setQty} />
              <Button onClick={handleAddToCart} variant="primary" size="md" type="button">
                {added
                  ? 'Added to cart ✓'
                  : qty === 1
                    ? 'Add my custom piece'
                    : `Add ${qty} to cart`}
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
                  ) : template === 'coaster' ? (
                    <CoasterPreview2D
                      text={text || defaultText}
                      primary={primary}
                      secondary={secondary}
                      font={font}
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

interface QuantityStepperProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

function QuantityStepper({ value, onChange, min = 1, max = 10 }: QuantityStepperProps) {
  // Keep a separate string state for the input so the field can briefly be
  // empty / mid-edit ("" while the user backspaces from "1" to type "10")
  // without the parent's number value collapsing to 0 or NaN. The external
  // value wins on commit (blur / Enter) and on prop changes.
  const [draft, setDraft] = useState<string>(String(value));
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n)) {
      const clamped = Math.min(max, Math.max(min, n));
      onChange(clamped);
      setDraft(String(clamped));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink-900 px-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-9 w-9 place-items-center rounded-full text-lg leading-none text-ink-900 transition-colors hover:bg-cream-50 disabled:cursor-not-allowed disabled:text-ink-500"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Quantity"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
        }}
        className="w-10 bg-transparent text-center font-mono text-sm tabular-nums text-ink-900 focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="grid h-9 w-9 place-items-center rounded-full text-lg leading-none text-ink-900 transition-colors hover:bg-cream-50 disabled:cursor-not-allowed disabled:text-ink-500"
      >
        +
      </button>
    </div>
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

interface CoasterPreview2DProps {
  text: string;
  primary: string;
  secondary: string;
  font: FontOption;
  ariaLabel: string;
}

// Round coaster: a solid disc with a thin halo rim and the name centred.
// Two visible layers — secondary is the back halo + base ring, primary is
// the face of the disc; the engraved name uses secondary so it reads off
// the disc. Mirrors the 3D coaster geometry's material assignment.
function CoasterPreview2D({
  text,
  primary,
  secondary,
  font,
  ariaLabel,
}: CoasterPreview2DProps) {
  // Name fontSize scales down for long strings so it stays inside the disc.
  const len = Math.max(text.trim().length, 3);
  const nameSize = Math.round(Math.min(70, Math.max(28, 280 / len)));
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 320 320"
      className="block h-auto w-full max-w-[360px]"
      style={{ filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.12))' }}
    >
      {/* Halo / base ring */}
      <circle cx={160} cy={160} r={148} fill={secondary} />
      {/* Disc face */}
      <circle cx={160} cy={160} r={132} fill={primary} />
      {/* Inner decorative ring — thin engrave line in secondary, suggests
          the laser-scored inner border typical of Eid/coaster designs. */}
      <circle
        cx={160}
        cy={160}
        r={118}
        fill="none"
        stroke={secondary}
        strokeWidth={2}
        opacity={0.55}
      />
      <text
        x={160}
        y={160}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily={font.family}
        fontStyle={font.italic ? 'italic' : 'normal'}
        fontSize={nameSize}
        fill={secondary}
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

function extractDefaultText(productName: string, fallback: string): string {
  const m = productName.match(/[""]([^""]+)[""]/);
  return m && m[1] ? m[1] : fallback;
}

function textFontSize(text: string): number {
  const len = Math.max((text || 'Your name').length, 3);
  return Math.round(Math.min(110, Math.max(38, 480 / len)));
}

