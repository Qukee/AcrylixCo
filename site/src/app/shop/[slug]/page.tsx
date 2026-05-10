import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/site/Container';
import { Button } from '@/components/site/Button';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { StructuredData } from '@/components/site/StructuredData';
import { CategorySidebar } from '../CategorySidebar';
import {
  getAllCategories,
  getProductBySlug,
  getProductsByCategory,
} from '@/lib/catalog/queries';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (product) {
    return {
      title: `${product.product.name} — AcrylixCo`,
      description: product.product.description,
    };
  }
  const cats = await getAllCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (cat) {
    return {
      title: `${cat.name} — Shop — AcrylixCo`,
      description: `Browse ${cat.name.toLowerCase()} acrylic pieces from AcrylixCo.`,
    };
  }
  return { title: 'Not found — AcrylixCo' };
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ShopSlugPage({ params }: RouteParams) {
  const { slug } = await params;

  // Try product first.
  const result = await getProductBySlug(slug);
  if (result) {
    const { product, images, categories } = result;
    return (
      <Container className="py-16 md:py-24">
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: images.map((i) => i.url),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'AUD',
              price: (product.priceCents / 100).toFixed(2),
              availability: product.inStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
            },
          }}
        />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          <Link href="/shop" className="hover:text-ink-900">
            Shop
          </Link>
          {categories[0] && (
            <>
              {' / '}
              <Link href={`/shop/${categories[0].slug}`} className="hover:text-ink-900">
                {categories[0].name}
              </Link>
            </>
          )}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="grid gap-4">
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.url}
                alt={img.alt}
                className="aspect-[4/3] w-full rounded-md bg-cream-200 object-cover"
              />
            ))}
          </div>

          <div>
            <h1 className="font-serif text-4xl italic">{product.name}</h1>
            <p className="mt-4 font-mono text-sm tracking-[0.14em] text-ink-500">
              {product.materialsSummary} · {product.widthCm} cm wide
            </p>
            <p className="mt-6 text-ink-700 md:text-lg">{product.description}</p>
            <p className="mt-8 font-serif text-3xl">{formatPrice(product.priceCents)} AUD</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg">Add to cart</Button>
              <Button href="/customize" size="lg" variant="ghost">
                Customize this design
              </Button>
            </div>

            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
              Made to order · ships from Sydney in 7–10 days
            </p>
          </div>
        </div>
      </Container>
    );
  }

  // Otherwise, treat as category slug.
  const cats = await getAllCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const products = await getProductsByCategory(slug);
  return (
    <Container className="py-16 md:py-24">
      <SectionTitle eyebrow="Shop" title={cat.name} description={cat.description ?? undefined} />
      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr]">
        <CategorySidebar categories={cats} activeSlug={cat.slug} />
        <ProductGrid products={products} />
      </div>
    </Container>
  );
}
