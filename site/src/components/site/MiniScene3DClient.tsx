'use client';

import dynamic from 'next/dynamic';

// Keep R3F + Three off the PDP's first paint by lazy-importing the actual
// scene module only when the 3D toggle is engaged.
const MiniScene3D = dynamic(() => import('./MiniScene3D').then((m) => m.MiniScene3D), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        Loading 3D…
      </span>
    </div>
  ),
});

interface MiniScene3DClientProps {
  text: string;
  primaryHex: string;
  secondaryHex: string;
  fontUrl: string;
  borderWidthMm: number;
}

export function MiniScene3DClient(props: MiniScene3DClientProps) {
  return <MiniScene3D {...props} />;
}
