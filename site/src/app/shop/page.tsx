import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { CategorySidebar } from './CategorySidebar';
import { getAllProducts, getAllCategories } from '@/lib/catalog/queries';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop — AcrylixCo',
  description:
    'Browse our pre-made multi-layered acrylic pieces — name plaques, monograms, ornaments, and more.',
};

// Hits the DB at render time. See site/src/app/page.tsx for context.
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return (
    <Container className="py-16 md:py-24">
      <SectionTitle
        eyebrow="Shop"
        title="The full collection."
        description="Every piece is laser-cut to order in Sydney. Sizes are approximate; reach out for custom dimensions."
      />
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <CategorySidebar categories={categories} activeSlug={null} />
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
