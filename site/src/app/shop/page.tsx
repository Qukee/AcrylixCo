import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { CategorySidebar } from './CategorySidebar';
import {
  getAllProducts,
  getAllCategories,
  type ProductFilters,
} from '@/lib/catalog/queries';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop — AcrylixCo',
  description:
    'Browse our pre-made multi-layered acrylic pieces — name plaques, monograms, ornaments, and more.',
};

// Hits the DB at render time. See site/src/app/page.tsx for context.
export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: Promise<{ layers?: string; price?: string }>;
}

function parseFilters(sp: { layers?: string; price?: string }): ProductFilters {
  const filters: ProductFilters = {};
  if (sp.layers === '1' || sp.layers === '2' || sp.layers === '3') {
    filters.layerCount = Number(sp.layers) as 1 | 2 | 3;
  } else if (sp.layers === 'mixed') {
    filters.layerCount = 'mixed';
  }
  if (sp.price === 'under-50') {
    filters.priceMaxCents = 5000;
  } else if (sp.price === '50-100') {
    filters.priceMinCents = 5000;
    filters.priceMaxCents = 10000;
  } else if (sp.price === '100-200') {
    filters.priceMinCents = 10000;
    filters.priceMaxCents = 20000;
  } else if (sp.price === '200-plus') {
    filters.priceMinCents = 20000;
  }
  return filters;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [products, categories] = await Promise.all([
    getAllProducts(filters),
    getAllCategories(),
  ]);

  return (
    <Container className="py-16 md:py-24">
      <SectionTitle
        eyebrow="Shop"
        title="Our full studio shelf."
        description="Every piece is laser-cut to order in Sydney. Sizes are approximate; reach out for custom dimensions."
      />
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <CategorySidebar
          categories={categories}
          activeSlug={null}
          activeLayers={sp.layers ?? null}
          activePrice={sp.price ?? null}
        />
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
