'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'acx_popup_v1';
const SUPPRESS_DAYS = 30;
const SHOW_AFTER_MS = 25_000;

function hasCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`${name}=`));
}

function setCookie(name: string, days: number) {
  const expiry = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${name}=1; path=/; expires=${expiry}; SameSite=Lax`;
}

export function FirstVisitPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (hasCookie(COOKIE_NAME)) return;
    const timer = setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setCookie(COOKIE_NAME, SUPPRESS_DAYS);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-heading"
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 px-4"
    >
      <div className="relative w-full max-w-md rounded-md border border-cream-400 bg-cream-50 p-8 shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={dismiss}
          className="absolute right-4 top-4 font-mono text-xs text-ink-500 hover:text-ink-900"
        >
          ✕
        </button>
        {!submitted ? (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              First-visit offer
            </p>
            <h2 id="popup-heading" className="mt-3 font-serif text-3xl italic">
              10% off your first piece.
            </h2>
            <p className="mt-3 text-ink-700">
              Plus first dibs on new colours and limited drops. We won&rsquo;t
              email more than once a week.
            </p>
            <form
              className="mt-6 flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                try {
                  await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    body: data,
                  });
                } catch {
                  // Network failures are silent; the cookie still suppresses.
                }
                setCookie(COOKIE_NAME, SUPPRESS_DAYS);
                setSubmitted(true);
              }}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                aria-label="Email address"
                className="rounded-md border border-cream-400 bg-cream-100 px-4 py-3 text-base text-ink-900 placeholder:text-ink-500"
              />
              <button
                type="submit"
                className="rounded-md bg-ink-900 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-cream-50 hover:bg-ink-700"
              >
                Get my code
              </button>
            </form>
            <button
              type="button"
              onClick={dismiss}
              className="mt-4 w-full text-center font-mono text-xs uppercase tracking-[0.14em] text-ink-500 hover:text-ink-900"
            >
              No thanks
            </button>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
              Code on its way
            </p>
            <h2 className="mt-3 font-serif text-2xl italic">
              Check your inbox in a few minutes.
            </h2>
            <p className="mt-3 text-ink-700">
              Use the code at checkout for 10% off. Valid on your first order.
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-md bg-ink-900 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-cream-50"
            >
              Keep browsing
            </button>
          </>
        )}
      </div>
    </div>
  );
}
