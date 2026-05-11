'use client';

import { useState } from 'react';
import { Button } from '@/components/site/Button';
import { useCart } from './CartProvider';
import type { CartLineAttribute } from '@/lib/shopify/cart';

interface AddToCartButtonProps {
  variantId: string;
  attributes?: CartLineAttribute[];
  label?: string;
  size?: 'md' | 'lg';
  // Whether to flash the success state (default true). Callers like the editor
  // sometimes want to show their own toast instead.
  showSuccess?: boolean;
  // Whether to pop the cart drawer on success (default true).
  openDrawerOnAdd?: boolean;
}

export function AddToCartButton({
  variantId,
  attributes,
  label = 'Add to cart',
  size = 'lg',
  showSuccess = true,
  openDrawerOnAdd = true,
}: AddToCartButtonProps) {
  const { addLine, openDrawer } = useCart();
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    if (busy || !variantId) return;
    setBusy(true);
    try {
      await addLine(variantId, 1, attributes);
      if (showSuccess) {
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2400);
      }
      if (openDrawerOnAdd) openDrawer();
    } catch (err) {
      console.error('addLine failed', err);
      // Leaving the failure silent on the UI for now — Phase D wires real
      // error toasts. The button just goes back to its default state.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={handleClick} size={size} variant="primary" type="button">
      {added ? 'Added to cart ✓' : busy ? 'Adding…' : label}
    </Button>
  );
}
