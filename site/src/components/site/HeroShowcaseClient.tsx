'use client';

import dynamic from 'next/dynamic';

const HeroShowcase = dynamic(
  () => import('./HeroShowcase').then((m) => m.HeroShowcase),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-cream-100 ring-1 ring-cream-300/60 md:aspect-[5/6]"
        aria-hidden
      >
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Loading the studio…
          </span>
        </div>
      </div>
    ),
  },
);

export function HeroShowcaseClient() {
  return <HeroShowcase />;
}
