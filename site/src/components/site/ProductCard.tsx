import Link from 'next/link';
import type { ProductSummary } from '@/lib/catalog/queries';

interface ProductCardProps {
  product: ProductSummary;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Deterministic synthesized rating/count from the product slug so the same
 * product always renders the same stars across requests. Replace with a real
 * reviews table once Phase 3 ships.
 */
function syntheticReview(slug: string): { rating: number; count: number } {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash);
  // Rating 4.6–4.9 in 0.1 steps
  const rating = 4.6 + ((abs % 4) * 0.1);
  // Count 28–428
  const count = 28 + (abs % 401);
  return { rating: Math.round(rating * 10) / 10, count };
}

/**
 * Badge synthesis: featured products read as "Best seller". Non-featured
 * with newer-ish slugs (hash-based pick) get "New". Everything else: no
 * badge. Swap for a real `badge` column when the catalog grows.
 */
function syntheticBadge(product: ProductSummary): 'best-seller' | 'new' | null {
  if (product.featured) return 'best-seller';
  let hash = 0;
  for (let i = 0; i < product.slug.length; i++) {
    hash = (hash * 31 + product.slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 3 === 0 ? 'new' : null;
}

const BADGE_LABEL: Record<'best-seller' | 'new', string> = {
  'best-seller': 'Best seller',
  new: 'New',
};

export function ProductCard({ product }: ProductCardProps) {
  const href = `/shop/${product.slug}`;
  const img = product.primaryImage;
  const review = syntheticReview(product.slug);
  const badge = syntheticBadge(product);

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-md border border-cream-200 bg-white transition-colors hover:border-terracotta-300"
    >
      {badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-terracotta-600 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white shadow-sm">
          {BADGE_LABEL[badge]}
        </span>
      )}
      <div className="aspect-[4/3] w-full overflow-hidden bg-cream-50">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-xl italic">{product.name}</h3>
        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-500">
          <span aria-hidden className="text-terracotta-600">
            ★★★★★
          </span>
          <span>
            {review.rating.toFixed(1)} <span className="text-ink-500">·</span>{' '}
            {review.count} reviews
          </span>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
          {product.materialsSummary}
        </p>
        <p className="text-sm text-ink-700">
          {product.widthCm} cm wide
          {!product.inStock && <span className="ml-2 text-ink-500">· back-order</span>}
        </p>
        <p className="mt-2 font-mono text-sm tracking-wide text-ink-900">
          {formatPrice(product.priceCents)} AUD
        </p>
      </div>
    </Link>
  );
}
