import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'All pieces' },
      { href: '/shop/kids', label: 'Kids' },
      { href: '/shop/islamic', label: 'Islamic' },
      { href: '/shop/gifts', label: 'Gifts' },
      { href: '/shop/name-plaques', label: 'Name plaques' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: '/faq', label: 'How customisation works' },
      { href: '/care', label: 'Care instructions' },
      { href: '/shipping', label: 'Shipping & returns' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-cream-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="font-serif text-base italic text-ink-900 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              Stay in touch
            </h3>
            <p className="mt-4 font-serif text-base italic text-ink-700">
              10% off your first piece, plus first dibs on new colours.
            </p>
            <form className="mt-4 flex" action="/api/newsletter/subscribe" method="post">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                aria-label="Email address"
                className="w-full rounded-l-md border border-cream-300 bg-cream-50 px-4 py-2 text-sm text-ink-900 placeholder:text-ink-500"
              />
              <button
                type="submit"
                className="rounded-r-md border border-l-0 border-ink-900 bg-ink-900 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-cream-50 hover:bg-ink-700"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-ink-500">
              We&rsquo;ll send no more than once a week.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-cream-200 pt-8">
          <p className="font-serif text-lg italic text-ink-700">
            From the studio, Sydney. Every piece is made to order, by hand, in
            our Inner West workshop.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 md:flex-row md:items-center md:justify-between">
          <p>AcrylixCo · ABN coming soon · © {new Date().getFullYear()}</p>
          <ul className="flex gap-4">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Amex</li>
            <li>Apple Pay</li>
            <li>Afterpay</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
