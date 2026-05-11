import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { ProductGallery } from '@/components/site/ProductGallery';
import { ProductMiniEditor } from '@/components/site/ProductMiniEditor';
import { Button } from '@/components/site/Button';
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


// Pick the 3D editor template that best mirrors the product the shopper is on.
//   - 'big-letter' → an oversized serif initial with the name laid inside the
//     counter (Big Letter Sign family, oval-frame favour tags).
//   - 'coaster'    → a round disc with a centred name (Eid round plaques /
//     coasters). Dimensions slider is hidden — only colours, text and font
//     are editable.
//   - 'plaque'     → single-line text on a clean plaque (everything else).
// Mapping is explicit per Shopify product handle so we don't accidentally
// fall back to the wrong style when adding products.
const BIG_LETTER_HANDLES = new Set([
  'big-letter-sign',
  'olivia-circular-frame', // legacy
  'big-initial-favour-tag',
  'mini-initial-honey-favour',
]);

const COASTER_HANDLES = new Set(['first-eid-round-plaque']);

function editorTemplateFor(slug: string): 'plaque' | 'big-letter' | 'coaster' {
  if (BIG_LETTER_HANDLES.has(slug)) return 'big-letter';
  if (COASTER_HANDLES.has(slug)) return 'coaster';
  return 'plaque';
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

            {/* Review stars (synthesized) — replace with real reviews in Phase 4. */}
            <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-ink-500">
              <span aria-hidden className="text-terracotta-600 text-base">
                ★★★★★
              </span>
              <span>
                {pdpReview(product.slug).rating.toFixed(1)}{' '}
                <span className="text-ink-500">·</span>{' '}
                {pdpReview(product.slug).count} reviews
              </span>
            </div>

            <p className="mt-6 text-ink-700 md:text-lg">{product.description}</p>

            <p className="mt-8 font-serif text-3xl">{formatPrice(product.priceCents)} AUD</p>

            {/* Primary CTA is the customiser below. Top-of-page add-to-cart was
                making it easy to miss the editor entirely. */}
            <div className="mt-8">
              <Button href="#customise" size="lg">
                Customise yours ↓
              </Button>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
                Type your name, pick colours, see it live below.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <ProductMiniEditor
        product={product}
        categories={categories}
        template={editorTemplateFor(product.slug)}
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
