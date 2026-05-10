import Link from 'next/link';
import { Container } from './Container';

/**
 * Seasonal sale banner — sits between the trust strip and "How it works".
 * The terracotta-100 surface gives the page a hot conversion beat without
 * resorting to candy-red. Copy can rotate with the season.
 */
export function SaleBanner() {
  return (
    <section className="border-b border-terracotta-200 bg-terracotta-50">
      <Container className="py-8 md:py-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terracotta-600 font-serif text-base italic text-white"
            >
              %
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-terracotta-700">
                Wedding season
              </p>
              <p className="mt-1 font-serif text-lg italic text-ink-900 md:text-xl">
                Buy two pieces, save 10% with code{' '}
                <span className="font-semibold not-italic tracking-[0.06em]">DUO10</span>
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta-700 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-white transition-colors hover:bg-terracotta-600"
          >
            Shop the pairs →
          </Link>
        </div>
      </Container>
    </section>
  );
}
