import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductMiniEditor } from '../ProductMiniEditor';
import type { ProductSummary } from '@/lib/catalog/queries';

const baseProduct: ProductSummary = {
  id: 'prod-mia-heart-baby',
  slug: 'mia-heart-baby',
  name: '"Mia" Heart Plaque',
  description: 'A heart plaque.',
  priceCents: 8500,
  widthCm: 22,
  inStock: true,
  featured: false,
  materialsSummary: 'Matte cream over mirror gold',
  primaryImage: null,
};

describe('ProductMiniEditor', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the default text parsed from the product name in the SVG label', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Mia'));
  });

  it('updates the rendered text when the user types', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);
    const input = screen.getByLabelText('Your text') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Zara' } });
    expect(input.value).toBe('Zara');
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Zara'));
  });

  it('opens the primary colour picker and lets the user select a swatch', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);
    const trigger = screen.getByRole('button', { expanded: false, name: /matte ink/i });
    fireEvent.click(trigger);
    const terracotta = screen.getByRole('option', { name: 'Terracotta' });
    expect(terracotta).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(terracotta);
    // After selection, the picker collapses and the trigger label updates.
    expect(
      screen.queryByRole('button', { expanded: true }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /terracotta/i })).toBeInTheDocument();
  });

  it('writes the customization (with font) to localStorage when Add to cart is clicked', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);

    // Pick a non-default font so we can assert the chosen typeface lands in the payload.
    const fontSelect = screen.getByLabelText('Font') as HTMLSelectElement;
    fireEvent.change(fontSelect, { target: { value: 'script' } });

    const addBtn = screen.getByRole('button', { name: /add my custom piece/i });
    fireEvent.click(addBtn);

    const raw = window.localStorage.getItem('acx_cart_v1');
    expect(raw).not.toBeNull();
    const cart = JSON.parse(raw as string);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productSlug).toBe('mia-heart-baby');
    expect(cart.items[0].customization.text).toBe('Mia');
    expect(cart.items[0].customization.font).toBe('script');
    expect(cart.items[0].qty).toBe(1);
    expect(addBtn.textContent).toMatch(/added to cart/i);
  });
});
