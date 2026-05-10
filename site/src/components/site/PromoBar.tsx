'use client';

import { useEffect, useState } from 'react';

/**
 * Sticky promo bar at the very top of the page — the highest-friction
 * conversion lure on the storefront. Sticks to the viewport top during scroll
 * so the offer stays visible. Dismissed state persists for the session via
 * sessionStorage (so closing it doesn't re-open on every page nav).
 *
 * Once the cart lands in Phase 3, this is where the "X away from free
 * shipping" progress bar will mount.
 */
const STORAGE_KEY = 'acx_promo_dismissed_v1';

export function PromoBar() {
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHydrated(true);
    setOpen(window.sessionStorage.getItem(STORAGE_KEY) !== '1');
  }, []);

  if (!hydrated || !open) return null;

  return (
    <div className="sticky top-0 z-50 bg-terracotta-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] md:gap-6">
        <span aria-hidden className="hidden md:inline">
          ★
        </span>
        <span>
          First piece? <span className="font-semibold">10% off</span> with code{' '}
          <span className="rounded-sm bg-white/15 px-1.5 py-0.5 font-semibold tracking-[0.18em]">
            WELCOME10
          </span>
        </span>
        <a
          href="/shop"
          className="hidden underline decoration-white/40 underline-offset-2 hover:decoration-white md:inline"
        >
          Shop now →
        </a>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem(STORAGE_KEY, '1');
            setOpen(false);
          }}
          aria-label="Dismiss promotion"
          className="ml-2 grid h-5 w-5 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <span aria-hidden className="text-sm leading-none">
            ×
          </span>
        </button>
      </div>
    </div>
  );
}
