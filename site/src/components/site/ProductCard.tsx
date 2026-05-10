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

export function ProductCard({ product }: ProductCardProps) {
  const href = `/shop/${product.slug}`;
  const img = product.primaryImage;
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-md border border-cream-300/60 bg-cream-50 transition-colors hover:border-cream-400"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-cream-200">
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
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
          {product.materialsSummary}
        </p>
        <p className="text-sm text-ink-700">
          {product.widthCm} cm wide
          {!product.inStock && (
            <span className="ml-2 text-ink-500">· back-order</span>
          )}
        </p>
        <p className="mt-2 font-mono text-sm tracking-wide text-ink-900">
          {formatPrice(product.priceCents)} AUD
        </p>
      </div>
    </Link>
  );
}
