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

  it('toggles aria-pressed on a foreground swatch when clicked', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);
    // Terracotta swatch starts unselected (Matte ink is the default).
    const terracotta = screen.getByRole('button', {
      name: 'Foreground colour: Terracotta',
    });
    expect(terracotta).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(terracotta);
    expect(terracotta).toHaveAttribute('aria-pressed', 'true');
    const matteInk = screen.getByRole('button', {
      name: 'Foreground colour: Matte ink',
    });
    expect(matteInk).toHaveAttribute('aria-pressed', 'false');
  });

  it('writes the customization to localStorage when Add to cart is clicked', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);
    // Pick a non-default terracotta foreground so we can assert the chosen colour
    // landed in the saved payload.
    fireEvent.click(
      screen.getByRole('button', { name: 'Foreground colour: Terracotta' }),
    );
    const addBtn = screen.getByRole('button', { name: /add my custom piece/i });
    fireEvent.click(addBtn);

    const raw = window.localStorage.getItem('acx_cart_v1');
    expect(raw).not.toBeNull();
    const cart = JSON.parse(raw as string);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productSlug).toBe('mia-heart-baby');
    expect(cart.items[0].customization.text).toBe('Mia');
    expect(cart.items[0].customization.foreground.toLowerCase()).toBe('#b77b5e');
    expect(cart.items[0].qty).toBe(1);

    // Button copy flips to a confirmation state.
    expect(addBtn.textContent).toMatch(/added to cart/i);
  });
});
