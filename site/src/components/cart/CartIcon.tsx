'use client';

import { useCart } from './CartProvider';

export function CartIcon() {
  const { count, openDrawer } = useCart();
  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={`Open cart (${count} ${count === 1 ? 'item' : 'items'})`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-cream-50 hover:text-ink-900"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2.5l2.5 12h10l2.5-9h-14" />
        <circle cx="9" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-terracotta-600 px-1 font-mono text-[10px] font-semibold leading-none text-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}
