'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Free AU shipping on orders over $150',
  'Designed in Sydney · dispatched in 7–10 days',
  'Afterpay available at checkout',
];

export function Announcement() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, [reduced]);

  if (reduced) {
    return (
      <div className="bg-cream-100 text-ink-700">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-8 gap-y-1 px-6 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em]">
          {MESSAGES.map((m) => (
            <span key={m}>· {m}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-100 text-ink-700" aria-live="polite" aria-atomic="true">
      <p className="mx-auto max-w-7xl px-6 py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em]">
        {MESSAGES[index] ?? MESSAGES[0]!}
      </p>
    </div>
  );
}
