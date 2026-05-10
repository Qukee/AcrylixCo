import { Container } from './Container';
import { Button } from './Button';
import { SectionTitle } from './SectionTitle';

const STEPS = [
  {
    n: '01',
    title: 'Design in 3D',
    body: 'Pick a shape, type the name, choose your finishes. See it from every angle in real time.',
  },
  {
    n: '02',
    title: 'Confirm and order',
    body: 'What you preview is what we make. No email proofs, no surprises — your screen is the spec sheet.',
  },
  {
    n: '03',
    title: 'Laser-cut and shipped',
    body: 'We cut, sand, hand-finish and dispatch from our Sydney studio in 7–10 days. Tracked across Australia.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-cream-300/60">
      <Container className="py-16 md:py-24">
        <SectionTitle
          eyebrow="How it works"
          title="From your screen to your shelf, in three steps."
        />
        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-cream-300/60 bg-cream-300/60 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-cream-50 p-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                Step {s.n}
              </p>
              <h3 className="mt-3 font-serif text-2xl italic">{s.title}</h3>
              <p className="mt-3 text-ink-700">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Button href="/customize" size="lg">
            Start your design
          </Button>
        </div>
      </Container>
    </section>
  );
}
