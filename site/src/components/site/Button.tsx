import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'link';
type Size = 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-ink-900 text-cream-50 hover:bg-ink-700 active:translate-y-px transition-colors',
  ghost:
    'border border-ink-700 text-ink-900 hover:bg-cream-50 active:translate-y-px transition-colors',
  link: 'text-ink-700 underline underline-offset-4 hover:text-ink-900 transition-colors',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<'button'> & { href?: undefined };
type LinkButtonProps = BaseProps & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = 'primary', size = 'md', className = '', children, ...rest } = props;
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-mono text-xs uppercase tracking-[0.16em] ${variants[variant]} ${sizes[size]} ${className}`;
  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest;
    return (
      <Link href={href} className={cls} {...anchorRest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...(rest as ComponentPropsWithoutRef<'button'>)}>
      {children}
    </button>
  );
}
