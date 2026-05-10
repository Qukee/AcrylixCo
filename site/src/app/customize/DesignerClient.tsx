'use client';

/*
 * Client-only loader for the Three.js designer.
 *
 * Next 16 forbids `next/dynamic` with `ssr: false` inside Server Components
 * (see node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md). The
 * canonical pattern from the from-vite migration guide is a Client Component
 * wrapper that does the dynamic import — so the route's page.tsx stays a
 * Server Component (preserving `export const metadata`) while Three.js,
 * @react-three/fiber, and @react-three/drei are kept out of the server bundle.
 */

import dynamic from 'next/dynamic';

const Designer = dynamic(() => import('./Designer'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-screen place-items-center text-ink-700">
      <p className="font-mono text-xs uppercase tracking-[0.18em]">Loading designer…</p>
    </div>
  ),
});

export default function DesignerClient() {
  return <Designer />;
}
