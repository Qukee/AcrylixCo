'use client';

import dynamic from 'next/dynamic';
import type { MiniScene3DTemplate } from './MiniScene3D';

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
  template: MiniScene3DTemplate;
}

export function MiniScene3DClient(props: MiniScene3DClientProps) {
  return <MiniScene3D {...props} />;
}
