import Link from 'next/link';
import { Container } from './Container';
import { SectionTitle } from './SectionTitle';

interface Hotspot {
  /** Percent positioning relative to the editorial photo. */
  x: number;
  y: number;
  productSlug: string;
  productName: string;
  priceLabel: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    x: 24,
    y: 42,
    productSlug: 'mj-wedding-monogram',
    productName: '"M & J" Wedding Monogram',
    priceLabel: '$138',
  },
  {
    x: 58,
    y: 56,
    productSlug: 'aisha-first-eid-plaque',
    productName: '"Aisha\'s First Eid"',
    priceLabel: '$85',
  },
  {
    x: 78,
    y: 32,
    productSlug: 'olivia-circular-frame',
    productName: '"Olivia" Frame',
    priceLabel: '$72',
  },
];

export function ShopTheLook() {
  return (
    <section className="border-y border-cream-300/60">
      <Container className="py-16 md:py-24">
        <SectionTitle
          eyebrow="Shop the look"
          title="Pieces, in the rooms they live in."
        />
        <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-md bg-cream-200">
          {/*
            Placeholder gradient. Real lifestyle photography lands in Phase 2.6.
            The hotspot positions assume a single hero photo with three pieces;
            adjust x/y when the photo is reshot.
          */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #f3ede0 0%, #ece5d3 40%, #c8c2b3 100%)',
            }}
            aria-hidden
          />
          <p className="absolute left-6 top-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            Editorial — coming soon
          </p>
          {HOTSPOTS.map((h) => (
            <Link
              key={h.productSlug}
              href={`/shop/${h.productSlug}`}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span className="relative grid h-7 w-7 place-items-center rounded-full bg-cream-50 shadow-md ring-1 ring-cream-400 transition-transform group-hover:scale-110">
                <span aria-hidden className="block h-2 w-2 rounded-full bg-ink-900" />
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-cream-50 px-3 py-2 shadow-md ring-1 ring-cream-400 group-hover:block">
                <span className="block font-serif text-sm italic text-ink-900">
                  {h.productName}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                  {h.priceLabel}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
