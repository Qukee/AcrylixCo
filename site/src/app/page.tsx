import { Container } from '@/components/site/Container';
import { Button } from '@/components/site/Button';
import { SectionTitle } from '@/components/site/SectionTitle';
import { ProductGrid } from '@/components/site/ProductGrid';
import { getFeaturedProducts, getAllCategories } from '@/lib/catalog/queries';
import Link from 'next/link';

export default async function HomePage() {
  const [featured, cats] = await Promise.all([getFeaturedProducts(4), getAllCategories()]);

  return (
    <>
      <section className="border-b border-cream-300/60">
        <Container className="py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
            Sydney · since 2024
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl italic leading-[1.05] md:text-7xl">
            Made-to-order acrylic decor for life&rsquo;s occasions.
          </h1>
          <p className="mt-6 max-w-xl text-ink-700 md:text-lg">
            Multi-layered, laser-cut pieces designed in Sydney. Pick from our shop, or design
            your own — every piece manufactured to order.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/shop" size="lg">
              Browse the shop
            </Button>
            <Button href="/customize" size="lg" variant="ghost">
              Design your own
            </Button>
          </div>
        </Container>
      </section>

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

      <section className="border-y border-cream-300/60 bg-cream-50">
        <Container className="py-16 md:py-24">
          <SectionTitle eyebrow="Browse" title="By the moment you&rsquo;re celebrating." />
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {cats.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="block rounded-md border border-cream-300/60 bg-cream-100 p-6 transition-colors hover:border-cream-400 hover:bg-cream-50"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
                    Category
                  </p>
                  <h3 className="mt-2 font-serif text-2xl italic">{c.name}</h3>
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
