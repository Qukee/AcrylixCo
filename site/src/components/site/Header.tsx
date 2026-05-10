import Link from 'next/link';

export function Header() {
  return (
    <header className="border-cream-300/60 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="border-cream-400 bg-cream-50 text-ink-900 grid h-8 w-8 place-items-center rounded-full border font-serif text-base italic"
          >
            A
          </span>
          <span className="text-ink-700 font-mono text-xs tracking-[0.18em] uppercase">
            AcrylixCo
          </span>
        </Link>
        <nav className="text-ink-700 flex items-center gap-6 font-mono text-xs tracking-[0.14em] uppercase">
          <Link href="/shop" className="hover:text-ink-900">
            Shop
          </Link>
          <Link href="/customize" className="hover:text-ink-900">
            Customize
          </Link>
          <Link href="/about" className="hover:text-ink-900">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
