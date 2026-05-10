interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionTitle({ eyebrow, title, description, align = 'left' }: SectionTitleProps) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl italic md:text-4xl">{title}</h2>
      {description && <p className="mt-4 max-w-2xl text-ink-700 md:text-lg">{description}</p>}
    </div>
  );
}
