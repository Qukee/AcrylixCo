'use client';

import { useState } from 'react';
import { Container } from './Container';
import { Button } from './Button';
import type { ProductSummary } from '@/lib/catalog/queries';

export interface ProductMiniEditorProps {
  product: ProductSummary;
  categories: { slug: string; name: string }[];
}

type Shape = 'heart' | 'circle' | 'topper' | 'plaque';

interface Swatch {
  hex: string;
  label: string;
}

const FOREGROUND_SWATCHES: Swatch[] = [
  { hex: '#2c2920', label: 'Ink' },
  { hex: '#ffffff', label: 'White' },
  { hex: '#b77b5e', label: 'Terracotta' },
  { hex: '#a99868', label: 'Gold' },
];

const BASE_SWATCHES: Swatch[] = [
  { hex: '#f5e1d2', label: 'Blush' },
  { hex: '#faf6ec', label: 'Ivory' },
  { hex: '#ece5d3', label: 'Sand' },
  { hex: '#2c2920', label: 'Ink' },
];

export function ProductMiniEditor({ product, categories }: ProductMiniEditorProps) {
  const shape = detectShape(product.slug, categories);
  const defaultText = extractDefaultText(product.name);
  const defaultForeground = FOREGROUND_SWATCHES[0]!.hex;
  const defaultBase = BASE_SWATCHES[0]!.hex;

  const [text, setText] = useState(defaultText);
  const [foreground, setForeground] = useState(defaultForeground);
  const [base, setBase] = useState(defaultBase);

  const reset = () => {
    setText(defaultText);
    setForeground(defaultForeground);
    setBase(defaultBase);
  };

  // White text on the ink base needs a different stroke to stay legible; we
  // keep the silhouette outline subtle and consistent regardless.
  const strokeColor = '#5a564d';
  const ariaLabel = `2D preview of ${product.name} customized to read ${text || 'your text'}`;

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
              Type your text, try a colour, then open the full 3D designer when
              you&apos;re ready.
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
                  className="mt-2 w-full max-w-sm rounded-md border border-cream-200 bg-cream-50 px-4 py-2.5 font-serif text-lg italic text-ink-900 placeholder:text-ink-500 focus:border-terracotta-500 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
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

              <div className="flex flex-wrap gap-3 pt-2">
                <Button href="/customize" variant="primary" size="md">
                  Open in 3D designer →
                </Button>
                <Button variant="ghost" size="md" onClick={reset} type="button">
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="w-full max-w-[480px] rounded-md bg-cream-100"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}
            >
              <svg
                role="img"
                aria-label={ariaLabel}
                viewBox="0 0 400 300"
                className="block h-auto w-full"
              >
                <Silhouette shape={shape} fill={base} stroke={strokeColor} />
                <ShapeText shape={shape} text={text} fill={foreground} />
              </svg>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              2D preview
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
      <div className="mt-2 flex gap-3">
        {swatches.map((s) => {
          const isSelected = s.hex.toLowerCase() === selected.toLowerCase();
          return (
            <button
              key={s.hex}
              type="button"
              aria-label={`${label}: ${s.label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(s.hex)}
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

interface SilhouetteProps {
  shape: Shape;
  fill: string;
  stroke: string;
}

function Silhouette({ shape, fill, stroke }: SilhouetteProps) {
  const common = { fill, stroke, strokeWidth: 1.2 };
  if (shape === 'heart') {
    return <path d={HEART_PATH} {...common} />;
  }
  if (shape === 'circle') {
    return <circle cx={200} cy={150} r={110} {...common} />;
  }
  if (shape === 'topper') {
    // Rounded text band plus two thin "stick" rectangles that get pushed into
    // the cake. Bands sit above the sticks so the joint reads cleanly.
    return (
      <g>
        <rect x={120} y={210} width={6} height={70} fill={fill} stroke={stroke} strokeWidth={1.2} />
        <rect x={274} y={210} width={6} height={70} fill={fill} stroke={stroke} strokeWidth={1.2} />
        <rect x={60} y={110} width={280} height={110} rx={18} ry={18} {...common} />
      </g>
    );
  }
  // Plaque default.
  return <rect x={50} y={70} width={300} height={170} rx={14} ry={14} {...common} />;
}

interface ShapeTextProps {
  shape: Shape;
  text: string;
  fill: string;
}

function ShapeText({ shape, text, fill }: ShapeTextProps) {
  const fontSize = shape === 'heart' ? 34 : shape === 'topper' ? 32 : shape === 'circle' ? 36 : 44;
  // Hearts read better with the text nudged slightly up from the geometric
  // centroid because the lower point pulls the visual centre down.
  const y = shape === 'heart' ? 160 : shape === 'topper' ? 168 : 162;
  return (
    <text
      x={200}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="var(--font-serif)"
      fontStyle="italic"
      fontSize={fontSize}
      fill={fill}
    >
      {text}
    </text>
  );
}

function detectShape(slug: string, cats: { slug: string; name: string }[]): Shape {
  const s = slug.toLowerCase();
  const catNames = cats.map((c) => c.name.toLowerCase());
  const catSlugs = cats.map((c) => c.slug.toLowerCase());
  if (s.includes('heart') || catNames.some((n) => n.includes('heart'))) return 'heart';
  if (s.includes('topper') || s.includes('cake') || catSlugs.includes('cake-toppers'))
    return 'topper';
  if (
    s.includes('circular') ||
    s.includes('frame') ||
    s.includes('mirror') ||
    catNames.some((n) => n.includes('mirror'))
  )
    return 'circle';
  return 'plaque';
}

function extractDefaultText(productName: string): string {
  // Matches both straight and smart double quotes used in the seed catalog.
  const m = productName.match(/[""]([^""]+)[""]/);
  return m && m[1] ? m[1] : 'Your name';
}

// Heart path centred around (200, 150) in the 400x300 viewBox. Two cubic
// curves meet at the bottom point; the top dip is the implicit join.
const HEART_PATH =
  'M200 230 C 120 180, 80 130, 110 90 C 130 60, 175 60, 200 100 C 225 60, 270 60, 290 90 C 320 130, 280 180, 200 230 Z';
