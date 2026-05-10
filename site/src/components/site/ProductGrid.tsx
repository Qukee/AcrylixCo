import type { ProductSummary } from '@/lib/catalog/queries';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <p className="font-mono text-sm uppercase tracking-[0.14em] text-ink-500">
        No products yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
