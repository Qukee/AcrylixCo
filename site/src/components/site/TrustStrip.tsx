interface TrustCell {
  title: string;
  detail: string;
}

const CELLS: TrustCell[] = [
  { title: 'Made in Sydney', detail: 'Cast acrylic, hand-finished' },
  { title: 'Made to order', detail: 'Each piece laser-cut just for you' },
  { title: 'Dispatched in 7–10 days', detail: 'Rush options available' },
  { title: 'Afterpay welcome', detail: 'Pay in four' },
];

export function TrustStrip() {
  return (
    <section className="border-b border-cream-300/60 bg-cream-50">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {CELLS.map((c) => (
          <li
            key={c.title}
            className="border-r border-cream-300/60 px-6 py-6 last:border-r-0 md:py-8"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              {c.detail}
            </p>
            <p className="mt-2 font-serif text-lg italic text-ink-900">{c.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
