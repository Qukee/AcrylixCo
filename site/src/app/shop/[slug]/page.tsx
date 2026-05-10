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
  getRelatedProducts,
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
    const related = await getRelatedProducts(product.id, 4);
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
                See it in 3D in your name
              </Button>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-cream-300/60 py-6 md:grid-cols-4">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  Made to order
                </dt>
                <dd className="mt-1 font-serif text-base italic text-ink-900">
                  For you, not from a shelf
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  Dispatch
                </dt>
                <dd className="mt-1 font-serif text-base italic text-ink-900">7–10 days</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  Shipping
                </dt>
                <dd className="mt-1 font-serif text-base italic text-ink-900">
                  Tracked AU-wide
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  Rush option
                </dt>
                <dd className="mt-1 font-serif text-base italic text-ink-900">
                  +$30 · 3–5 days
                </dd>
              </div>
            </dl>

            <details className="mt-8 border-t border-cream-300/60 pt-6">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.18em] text-ink-700 hover:text-ink-900">
                Materials &amp; dimensions
              </summary>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
                    Materials
                  </dt>
                  <dd className="font-serif italic text-ink-900">
                    {product.materialsSummary}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
                    Approx. width
                  </dt>
                  <dd className="font-serif italic text-ink-900">{product.widthCm} cm</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
                    Hardware
                  </dt>
                  <dd className="font-serif italic text-ink-900">
                    Tabletop stand included
                  </dd>
                </div>
              </dl>
            </details>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-cream-300/60 pt-12">
            <SectionTitle
              eyebrow="Pairs well with"
              title="Other pieces from the studio."
            />
            <div className="mt-10">
              <ProductGrid products={related} />
            </div>
          </section>
        )}
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
