import { Container } from '@/components/site/Container';
import { Button } from '@/components/site/Button';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { TrustStrip } from '@/components/site/TrustStrip';
import { HowItWorks } from '@/components/site/HowItWorks';
import {
  getFeaturedProducts,
  getOccasionCategories,
  getProductTypeCategories,
} from '@/lib/catalog/queries';
import Link from 'next/link';

// Page hits the DB. Railway doesn't inject env vars at Docker build time —
// without `force-dynamic`, the build crashes prerendering against the
// placeholder DATABASE_URL.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, occasions, productTypes] = await Promise.all([
    getFeaturedProducts(4),
    getOccasionCategories(),
    getProductTypeCategories(),
  ]);

  return (
    <>
      <section className="border-b border-cream-300/60">
        <Container className="py-20 md:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
            Sydney studio · since 2024
          </p>
          <h1 className="mt-3 max-w-4xl font-serif text-5xl italic leading-[1.05] md:text-7xl">
            Your name. Cast in light, layered in colour, made to last.
          </h1>
          <p className="mt-6 max-w-xl text-ink-700 md:text-lg">
            Design your piece in 3D, see it from every angle, then we&rsquo;ll laser-cut
            and ship it from our Sydney studio in 7–10 days.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/customize" size="lg">
              Design yours in 3D
            </Button>
            <Button href="/shop" size="lg" variant="ghost">
              Browse the studio
            </Button>
          </div>
        </Container>
      </section>

      <TrustStrip />

      <HowItWorks />

      <section>
        <Container className="py-16 md:py-24">
          <SectionTitle
            eyebrow="Featured"
            title="Made for moments worth keeping."
            description="Our most-requested pieces, ready to ship or be made-to-order in your colours."
          />
          <div className="mt-12">
            <ProductGrid products={featured} />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 md:py-24">
          <SectionTitle
            eyebrow="Browse"
            title="By the piece you&rsquo;re looking for."
          />
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {productTypes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="block rounded-md border border-cream-300/60 bg-cream-100 p-6 transition-colors hover:border-cream-400 hover:bg-cream-50"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
                    Product
                  </p>
                  <h3 className="mt-2 font-serif text-xl italic">{c.name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-cream-300/60 bg-cream-50">
        <Container className="py-16 md:py-24">
          <SectionTitle
            eyebrow="Browse"
            title="By who you&rsquo;re celebrating."
          />
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {occasions.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="block rounded-md border border-cream-300/60 bg-cream-50 p-6 transition-colors hover:border-cream-400"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
                    Occasion
                  </p>
                  <h3 className="mt-2 font-serif text-xl italic">{c.name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section>
        <Container className="py-20 md:py-28 text-center">
          <SectionTitle
            eyebrow="Customize"
            title="Or design something one of a kind."
            description="Pick a template, type the name, choose your finishes — see a 3D preview before you order."
            align="center"
          />
          <div className="mt-10 flex justify-center">
            <Button href="/customize" size="lg">
              Open the designer
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
