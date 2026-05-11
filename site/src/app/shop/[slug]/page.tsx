import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/site/Container';
import { Button } from '@/components/site/Button';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { ProductGallery } from '@/components/site/ProductGallery';
import { ProductMiniEditor } from '@/components/site/ProductMiniEditor';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
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

function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pdpReview(slug: string): { rating: number; count: number } {
  const h = slugHash(slug);
  return {
    rating: Math.round((4.6 + (h % 4) * 0.1) * 10) / 10,
    count: 28 + (h % 401),
  };
}

function pdpSpots(slug: string): number {
  return 3 + (slugHash(slug) % 5);
}

function dispatchDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 8);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default async function ShopSlugPage({ params }: RouteParams) {
  const { slug } = await params;

  // Try product first.
  const result = await getProductBySlug(slug);
  if (result) {
    const { product, images, categories, variantId } = result;
    const related = await getRelatedProducts(product.id, 4);
    return (
      <>
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
          <Link href="/" className="hover:text-ink-900">
            Studio
          </Link>
          {' / '}
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
          <ProductGallery images={images.map((i) => ({ url: i.url, alt: i.alt }))} />

          <div>
            <h1 className="font-serif text-4xl italic">{product.name}</h1>
            <p className="mt-4 font-mono text-sm tracking-[0.14em] text-ink-500">
              {product.materialsSummary} · {product.widthCm} cm wide
            </p>
            <p className="mt-6 text-ink-700 md:text-lg">{product.description}</p>

            {/* Review stars (synthesized) — replace with real reviews in Phase 4. */}
            <div className="mt-6 flex items-center gap-3 font-mono text-[11px] text-ink-500">
              <span aria-hidden className="text-terracotta-600 text-base">
                ★★★★★
              </span>
              <span>
                {pdpReview(product.slug).rating.toFixed(1)}{' '}
                <span className="text-ink-500">·</span>{' '}
                {pdpReview(product.slug).count} reviews
              </span>
            </div>

            <p className="mt-8 font-serif text-3xl">{formatPrice(product.priceCents)} AUD</p>

            {/* Stock urgency — synthesized from slug. Real value comes from the
                production queue once the studio dashboard lands. */}
            <p className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-terracotta-700">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-terracotta-600" />
              Only {pdpSpots(product.slug)} spots left this week
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCartButton variantId={variantId} />
              <Button href="/customize" size="lg" variant="ghost">
                See it in 3D in your name
              </Button>
            </div>

            {/* Multi-buy callout */}
            <div className="mt-6 flex items-start gap-3 rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3">
              <span aria-hidden className="mt-0.5 text-terracotta-700">
                +
              </span>
              <p className="text-sm text-ink-700">
                <span className="font-serif italic text-ink-900">
                  Buy two pieces, save 10%
                </span>{' '}
                with code{' '}
                <span className="rounded-sm bg-white px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-terracotta-700 ring-1 ring-terracotta-200">
                  DUO10
                </span>{' '}
                · perfect for matching wedding signage.
              </p>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-cream-200 py-6 md:grid-cols-4">
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
                  Dispatched by
                </dt>
                <dd className="mt-1 font-serif text-base italic text-ink-900">
                  {dispatchDate()}
                </dd>
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

            <details className="mt-8 border-t border-cream-200 pt-6">
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
      </Container>

      <ProductMiniEditor
        product={product}
        categories={categories}
        template={
          product.slug === 'big-letter-sign' || product.slug === 'olivia-circular-frame'
            ? 'big-letter'
            : 'plaque'
        }
        variantId={variantId}
      />

      {related.length > 0 && (
        <Container className="py-16 md:py-24">
          <section>
            <SectionTitle
              eyebrow="Pairs well with"
              title="Other pieces from the studio."
            />
            <div className="mt-10">
              <ProductGrid products={related} />
            </div>
          </section>
        </Container>
      )}
      </>
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
