import Link from 'next/link';
import { CartIcon } from '@/components/cart/CartIcon';

export function Header() {
  return (
    <header className="border-cream-200 bg-white border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="border-terracotta-200 bg-terracotta-50 text-terracotta-700 grid h-8 w-8 place-items-center rounded-full border font-serif text-base italic"
          >
            A
          </span>
          <span className="text-ink-700 font-mono text-xs tracking-[0.18em] uppercase">
            AcrylixCo
          </span>
        </Link>
        <nav className="text-ink-700 hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.14em] md:flex">
          <Link href="/shop" className="hover:text-ink-900">
            Shop
          </Link>
          <Link href="/shop/kids" className="hover:text-ink-900">
            Kids
          </Link>
          <Link href="/shop/islamic" className="hover:text-ink-900">
            Islamic
          </Link>
          <Link href="/shop/gifts" className="hover:text-ink-900">
            Gifts
          </Link>
          <CartIcon />
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/shop"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700"
          >
            Shop
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
