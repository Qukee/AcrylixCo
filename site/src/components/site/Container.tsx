import type { HTMLAttributes } from 'react';

export function Container({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-7xl px-6 ${className}`} {...rest} />;
}
