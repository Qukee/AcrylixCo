import { describe, it, expect } from 'vitest';
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
  it('renders the default text parsed from the product name in the SVG label', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Mia'),
    );
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
    // Terracotta swatch starts unselected (Ink is the default).
    const terracotta = screen.getByRole('button', {
      name: 'Foreground colour: Terracotta',
    });
    expect(terracotta).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(terracotta);
    expect(terracotta).toHaveAttribute('aria-pressed', 'true');
    // Previously-selected Ink swatch should now read unselected.
    const ink = screen.getByRole('button', { name: 'Foreground colour: Ink' });
    expect(ink).toHaveAttribute('aria-pressed', 'false');
  });
});
