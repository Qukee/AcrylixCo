import { Container } from '@/components/site/Container';
import { SectionTitle } from '@/components/site/SectionTitle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — AcrylixCo',
  description: 'Get in touch with AcrylixCo for custom orders, wholesale, or support.',
};

export default function ContactPage() {
  return (
    <Container className="max-w-3xl py-16 md:py-24">
      <SectionTitle
        eyebrow="Contact"
        title="Get in touch."
        description="Whether it's a custom order, a wholesale enquiry, or a support question — we read every email."
      />
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">Email</p>
          <p className="mt-2 font-serif text-2xl italic">
            <a href="mailto:hello@acrylixco.com.au" className="text-ink-900 hover:underline">
              hello@acrylixco.com.au
            </a>
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">Studio</p>
          <p className="mt-2 font-serif text-2xl italic">Sydney, Australia</p>
          <p className="mt-1 text-ink-700">By appointment only.</p>
        </div>
      </div>
    </Container>
  );
}
