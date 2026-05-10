import { Container } from './Container';
import { Button } from './Button';
import { SectionTitle } from './SectionTitle';
import './HowItWorks.css';

interface Step {
  n: string;
  title: string;
  body: string;
  Motion: () => React.ReactElement;
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Design in 3D',
    body: 'Pick a shape, type the name, choose your finishes. See it from every angle in real time.',
    Motion: DesignMotion,
  },
  {
    n: '02',
    title: 'Confirm and order',
    body: 'What you preview is what we make. No email proofs, no surprises — your screen is the spec sheet.',
    Motion: ConfirmMotion,
  },
  {
    n: '03',
    title: 'Laser-cut and shipped',
    body: 'We cut, sand, hand-finish and dispatch from our Sydney studio in 7–10 days. Tracked across Australia.',
    Motion: ShipMotion,
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
          {STEPS.map(({ n, title, body, Motion }) => (
            <li key={n} className="flex flex-col bg-cream-50 p-8">
              <div className="mb-6 grid h-28 w-full place-items-center rounded-sm bg-cream-100/70 ring-1 ring-cream-300/50">
                <Motion />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
                Step {n}
              </p>
              <h3 className="mt-3 font-serif text-2xl italic">{title}</h3>
              <p className="mt-3 text-ink-700">{body}</p>
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

function DesignMotion() {
  return (
    <div className="hiw-plaque">
      <svg
        width="120"
        height="72"
        viewBox="0 0 120 72"
        role="img"
        aria-label="A plaque rotating in 3D with a name being inscribed"
      >
        <rect
          x="14"
          y="14"
          width="92"
          height="44"
          rx="3"
          fill="none"
          stroke="#5a564d"
          strokeWidth="1.4"
        />
        <path
          className="hiw-plaque-text"
          d="M 26 42 Q 32 28 38 42 T 50 42 Q 56 30 62 42 Q 66 48 72 38 Q 78 30 84 42 L 96 42"
        />
      </svg>
    </div>
  );
}

function ConfirmMotion() {
  return (
    <svg
      width="120"
      height="72"
      viewBox="0 0 120 72"
      role="img"
      aria-label="A receipt with a checkmark being drawn"
    >
      <rect
        x="36"
        y="8"
        width="48"
        height="56"
        rx="2"
        fill="#faf6ec"
        stroke="#5a564d"
        strokeWidth="1.3"
      />
      <line
        className="hiw-receipt-line hiw-receipt-line-1"
        x1="44"
        y1="20"
        x2="76"
        y2="20"
        stroke="#8a8472"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        className="hiw-receipt-line hiw-receipt-line-2"
        x1="44"
        y1="28"
        x2="72"
        y2="28"
        stroke="#8a8472"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        className="hiw-receipt-line hiw-receipt-line-3"
        x1="44"
        y1="36"
        x2="68"
        y2="36"
        stroke="#8a8472"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path className="hiw-tick" d="M 44 52 L 54 60 L 76 44" />
    </svg>
  );
}

function ShipMotion() {
  return (
    <svg
      width="120"
      height="72"
      viewBox="0 0 120 72"
      role="img"
      aria-label="A laser cutting an acrylic shape, then a package being dispatched"
    >
      <rect
        x="22"
        y="20"
        width="76"
        height="32"
        rx="3"
        fill="none"
        stroke="#5a564d"
        strokeWidth="1.4"
      />
      <rect
        className="hiw-cut-fill"
        x="22"
        y="20"
        width="76"
        height="32"
        rx="3"
        fill="#ece5d3"
      />
      <rect
        x="22"
        y="20"
        width="76"
        height="32"
        rx="3"
        fill="none"
        stroke="#5a564d"
        strokeWidth="1.4"
      />
      <line
        className="hiw-laser-glow"
        x1="22"
        y1="14"
        x2="22"
        y2="58"
        stroke="#d6c294"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        className="hiw-laser"
        x1="22"
        y1="14"
        x2="22"
        y2="58"
        stroke="#a99868"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <g className="hiw-package">
        <rect
          x="20"
          y="28"
          width="14"
          height="14"
          rx="1"
          fill="#faf6ec"
          stroke="#5a564d"
          strokeWidth="1.2"
        />
        <line x1="20" y1="35" x2="34" y2="35" stroke="#5a564d" strokeWidth="1" />
        <line x1="27" y1="28" x2="27" y2="42" stroke="#5a564d" strokeWidth="1" />
      </g>
    </svg>
  );
}
