import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Care Instructions — AcrylixCo',
  description: 'How to care for your AcrylixCo acrylic piece — cleaning, mounting, and storage.',
};

export default function CarePage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="Care" title="Keeping your piece looking new." />
      <div className="prose mt-10 max-w-none font-serif text-lg text-ink-700">
        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Cleaning</h3>
        <p>
          Dust with a soft microfibre cloth. For fingerprints or smudges, use a damp microfibre
          cloth with a drop of dish soap; rinse with clean water and dry. <strong>Avoid</strong>{' '}
          ammonia-based cleaners (e.g. Windex), abrasive sponges, or paper towels — they will
          scratch the surface over time.
        </p>

        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Mounting</h3>
        <p>
          Most pieces ship with a clear acrylic stand for tabletop display. For wall mounting, use
          double-sided mounting strips suitable for the piece&rsquo;s weight (Command 3M strips
          work well for pieces under 500g). Avoid drilling — acrylic chips at drill points.
        </p>

        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Storage</h3>
        <p>
          Wrap in soft cloth and store flat or upright in a temperature-stable area (14–28 °C).
          Avoid prolonged direct sunlight — it can yellow some neon and clear finishes over time.
        </p>
      </div>
    </Container>
  );
}
