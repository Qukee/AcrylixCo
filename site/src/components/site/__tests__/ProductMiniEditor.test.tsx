import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductMiniEditor } from '../ProductMiniEditor';
import type { ProductSummary } from '@/lib/catalog/queries';

// useCart pulls a real network singleton; mock it so the test doesn't hit
// Shopify. addLineMock captures every call so the add-to-cart test can
// assert the customisation payload reaches the cart context.
const addLineMock = vi.fn<
  (
    variantId: string,
    quantity: number,
    attributes?: Array<{ key: string; value: string }>,
  ) => Promise<void>
>(() => Promise.resolve());
const openDrawerMock = vi.fn();
vi.mock('@/components/cart/CartProvider', () => ({
  useCart: () => ({
    cart: null,
    ready: true,
    count: 0,
    drawerOpen: false,
    openDrawer: openDrawerMock,
    closeDrawer: vi.fn(),
    addLine: addLineMock,
    updateLine: vi.fn(),
    removeLine: vi.fn(),
  }),
}));

const baseProduct: ProductSummary = {
  id: 'gid://shopify/Product/9151250465025',
  slug: 'big-letter-sign',
  name: 'Big Letter Sign',
  description: 'Our signature big-letter piece.',
  priceCents: 7200,
  widthCm: 38,
  inStock: true,
  featured: true,
  materialsSummary: 'Blush pink matte over ivory',
  primaryImage: null,
};
const baseVariantId = 'gid://shopify/ProductVariant/12345';

describe('ProductMiniEditor', () => {
  it('renders the default text parsed from the product name in the SVG label', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} variantId={baseVariantId} />);
    // Big Letter Sign has no quoted segment → falls back to "Your name".
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Your name'));
  });

  it('updates the rendered text when the user types', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} variantId={baseVariantId} />);
    const input = screen.getByLabelText('Your text') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Zara' } });
    expect(input.value).toBe('Zara');
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('Zara'));
  });

  it('opens the primary colour picker and lets the user select a swatch', () => {
    render(<ProductMiniEditor product={baseProduct} categories={[]} variantId={baseVariantId} />);
    const trigger = screen.getByRole('button', { expanded: false, name: /matte ink/i });
    fireEvent.click(trigger);
    const terracotta = screen.getByRole('option', { name: 'Terracotta' });
    expect(terracotta).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(terracotta);
    expect(screen.queryByRole('button', { expanded: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /terracotta/i })).toBeInTheDocument();
  });

  it('calls addLine with the customisation attributes when Add to cart is clicked', async () => {
    addLineMock.mockClear();
    render(<ProductMiniEditor product={baseProduct} categories={[]} variantId={baseVariantId} />);
    const fontSelect = screen.getByLabelText('Font') as HTMLSelectElement;
    fireEvent.change(fontSelect, { target: { value: 'script' } });

    const addBtn = screen.getByRole('button', { name: /add my custom piece/i });
    fireEvent.click(addBtn);

    await vi.waitFor(() => expect(addLineMock).toHaveBeenCalledTimes(1));
    const [variantArg, qtyArg, attributesArg] = addLineMock.mock.calls[0]!;
    expect(variantArg).toBe(baseVariantId);
    expect(qtyArg).toBe(1);
    const attrs = attributesArg as Array<{ key: string; value: string }>;
    expect(attrs).toContainEqual({ key: 'Text', value: 'Your name' });
    expect(attrs).toContainEqual({ key: 'Font', value: 'Flowing script' });
    const design = attrs.find((a) => a.key === '_design');
    expect(design).toBeDefined();
    expect(JSON.parse(design!.value)).toMatchObject({
      text: 'Your name',
      font: 'script',
      borderWidthMm: 6,
    });
  });
});
