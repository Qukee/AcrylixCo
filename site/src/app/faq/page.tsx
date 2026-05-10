import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — AcrylixCo',
  description:
    'Common questions about AcrylixCo custom acrylic pieces — turnaround, materials, customization, and care.',
};

const FAQ = [
  {
    q: 'How long until my piece ships?',
    a: 'Most orders ship from Sydney within 7–10 business days of confirmation. For custom designs we email a proof for your approval before manufacturing begins, which can add 1–2 days.',
  },
  {
    q: 'What materials do you use?',
    a: 'We use cast acrylic in mirror, matte, frosted, gloss, glitter, neon, and clear finishes. Sheet thickness is typically 5 mm; smaller ornaments are 3 mm and larger pieces 6 mm.',
  },
  {
    q: 'Can I customize the size, colours, or text?',
    a: 'Yes. Use the customizer at /customize to design your own piece, or email us with details for a custom order based on a catalog template.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'We currently only ship within Australia. Reach out if you have a one-off international request and we can quote shipping.',
  },
  {
    q: 'What if my piece arrives damaged?',
    a: 'Email us with photos within 7 days of delivery and we will remake the piece at no additional cost.',
  },
  {
    q: 'How should I care for my acrylic piece?',
    a: 'See our Care page for full instructions — short version: dust with a soft cloth, avoid abrasive cleaners.',
  },
];

export default function FaqPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="FAQ" title="Common questions." />
      <dl className="mt-12 divide-y divide-cream-300/60">
        {FAQ.map((entry) => (
          <div key={entry.q} className="py-6">
            <dt className="font-serif text-xl italic">{entry.q}</dt>
            <dd className="mt-2 text-ink-700">{entry.a}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
