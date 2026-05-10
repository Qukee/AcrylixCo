import Link from 'next/link';
import type { CategorySummary } from '@/lib/catalog/queries';

interface CategorySidebarProps {
  categories: CategorySummary[];
  activeSlug: string | null;
  activeLayers?: string | null;
  activePrice?: string | null;
}

const PRICE_RANGES: { value: string; label: string }[] = [
  { value: 'under-50', label: 'Under $50' },
  { value: '50-100', label: '$50 – $100' },
  { value: '100-200', label: '$100 – $200' },
  { value: '200-plus', label: '$200 +' },
];

const LAYER_TIERS: { value: string; label: string }[] = [
  { value: '1', label: 'Single layer' },
  { value: '2', label: 'Double layer' },
  { value: '3', label: 'Triple layer' },
  { value: 'mixed', label: 'Mixed material' },
];

function buildHref(activeSlug: string | null, params: Record<string, string | null>): string {
  const base = activeSlug ? `/shop/${activeSlug}` : '/shop';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

export function CategorySidebar({
  categories,
  activeSlug,
  activeLayers = null,
  activePrice = null,
}: CategorySidebarProps) {
  return (
    <aside className="space-y-10">
      <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          Categories
        </h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link
              href="/shop"
              className={`block py-1.5 font-serif text-lg italic transition-colors ${
                activeSlug === null
                  ? 'text-ink-900'
                  : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              All pieces
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/shop/${c.slug}`}
                className={`block py-1.5 font-serif text-lg italic transition-colors ${
                  activeSlug === c.slug
                    ? 'text-ink-900'
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          Layers
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <Link
              href={buildHref(activeSlug, { layers: null, price: activePrice })}
              className={`inline-block rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                activeLayers === null
                  ? 'border-ink-900 bg-ink-900 text-cream-50'
                  : 'border-cream-400 text-ink-700 hover:border-ink-700 hover:text-ink-900'
              }`}
            >
              Any
            </Link>
          </li>
          {LAYER_TIERS.map((t) => (
            <li key={t.value}>
              <Link
                href={buildHref(activeSlug, {
                  layers: t.value,
                  price: activePrice,
                })}
                className={`inline-block rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  activeLayers === t.value
                    ? 'border-ink-900 bg-ink-900 text-cream-50'
                    : 'border-cream-400 text-ink-700 hover:border-ink-700 hover:text-ink-900'
                }`}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          Price
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <Link
              href={buildHref(activeSlug, { layers: activeLayers, price: null })}
              className={`inline-block rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                activePrice === null
                  ? 'border-ink-900 bg-ink-900 text-cream-50'
                  : 'border-cream-400 text-ink-700 hover:border-ink-700 hover:text-ink-900'
              }`}
            >
              Any
            </Link>
          </li>
          {PRICE_RANGES.map((r) => (
            <li key={r.value}>
              <Link
                href={buildHref(activeSlug, {
                  layers: activeLayers,
                  price: r.value,
                })}
                className={`inline-block rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  activePrice === r.value
                    ? 'border-ink-900 bg-ink-900 text-cream-50'
                    : 'border-cream-400 text-ink-700 hover:border-ink-700 hover:text-ink-900'
                }`}
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
