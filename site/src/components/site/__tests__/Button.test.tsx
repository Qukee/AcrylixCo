import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders a button by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders an anchor when href is provided', () => {
    render(<Button href="/shop">Shop</Button>);
    const link = screen.getByRole('link', { name: 'Shop' });
    expect(link).toHaveAttribute('href', '/shop');
  });

  it('applies the ghost variant classes', () => {
    render(<Button variant="ghost">Browse</Button>);
    const btn = screen.getByRole('button', { name: 'Browse' });
    expect(btn.className).toMatch(/border-ink-700/);
  });
});
