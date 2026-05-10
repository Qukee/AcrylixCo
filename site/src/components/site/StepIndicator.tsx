interface Step {
  n: string;
  label: string;
}

const STEPS: Step[] = [
  { n: '01', label: 'Pick your shape' },
  { n: '02', label: 'Type your name' },
  { n: '03', label: 'Choose finishes' },
  { n: '04', label: 'Preview & order' },
];

export function StepIndicator() {
  return (
    <ol className="flex items-center justify-center gap-3 overflow-x-auto border-b border-cream-300/60 bg-cream-50 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
      {STEPS.map((s, i) => (
        <li key={s.n} className="flex shrink-0 items-center gap-2">
          <span className="text-ink-700">{s.n}</span>
          <span>{s.label}</span>
          {i < STEPS.length - 1 && (
            <span aria-hidden className="text-cream-400">
              ·
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
