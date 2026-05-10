import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — AcrylixCo',
  description: 'AcrylixCo makes multi-layered laser-cut acrylic decor in Sydney, Australia.',
};

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="About" title="Sydney-made acrylic decor for life's occasions." />
      <div className="prose mt-10 max-w-none font-serif text-lg text-ink-700">
        <p>
          AcrylixCo is a Sydney-based studio that makes multi-layered laser-cut acrylic pieces for
          life&rsquo;s milestones — births, weddings, religious holidays, corporate gifts.
        </p>
        <p>
          Every piece is built from at least two layers: a foreground (the name, monogram, or
          motif) bonded onto a base layer cut to follow the foreground&rsquo;s contour with an
          outward offset, creating a halo of colour around the design. Pieces are made to order —
          finished in mirror, matte, frosted, gloss, glitter, neon, or clear acrylic.
        </p>
        <p>
          We ship Australia-wide from our Sydney studio, with most orders posted within 7–10 days
          of confirmation.
        </p>
      </div>
    </Container>
  );
}
