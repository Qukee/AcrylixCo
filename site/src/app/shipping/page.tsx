import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Returns — AcrylixCo',
  description: 'AcrylixCo shipping rates, turnaround times, and return policy.',
};

export default function ShippingPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle eyebrow="Logistics" title="Shipping & returns." />
      <div className="prose mt-10 max-w-none font-serif text-lg text-ink-700">
        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Shipping</h3>
        <p>
          We ship Australia-wide via Australia Post. Standard parcel post is included on orders
          over $80 AUD. Express post is available at checkout for $14 AUD. Most orders are posted
          within 7–10 business days of confirmation.
        </p>

        <h3 className="mt-8 font-serif text-2xl italic text-ink-900">Returns</h3>
        <p>
          <strong>Made-to-order pieces (custom designs):</strong> non-returnable except in the case
          of manufacturing defects. We will remake any piece that arrives damaged or that
          materially differs from the approved design proof.
        </p>
        <p>
          <strong>Catalog pieces:</strong> returnable within 14 days for a refund minus return
          shipping, provided the piece is undamaged and unused.
        </p>
        <p>
          Email us at hello@acrylixco.com.au with photos within 7 days of delivery for damage or
          quality issues.
        </p>
      </div>
    </Container>
  );
}
