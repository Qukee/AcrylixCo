'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  cartCreate,
  cartLinesAdd,
  cartLinesRemove,
  cartLinesUpdate,
  getCart,
  type AddLineInput,
  type Cart,
  type CartLineAttribute,
} from '@/lib/shopify/cart';

interface CartContextValue {
  cart: Cart | null;
  ready: boolean;
  count: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addLine: (
    merchandiseId: string,
    quantity: number,
    attributes?: CartLineAttribute[],
  ) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const COOKIE_KEY = 'acx_cart_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]!) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; samesite=lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // On mount: try to hydrate the existing cart from cookie; otherwise leave
  // null and only create one when a user actually adds something. Avoids
  // pinging Shopify on every cold page load.
  useEffect(() => {
    let cancelled = false;
    const cartId = readCookie(COOKIE_KEY);
    if (!cartId) {
      setReady(true);
      return;
    }
    getCart(cartId)
      .then((c) => {
        if (cancelled) return;
        if (c) {
          setCart(c);
        } else {
          // Stale or expired cart on Shopify's side — drop the cookie.
          clearCookie(COOKIE_KEY);
        }
      })
      .catch(() => {
        clearCookie(COOKIE_KEY);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistCart = useCallback((c: Cart) => {
    setCart(c);
    writeCookie(COOKIE_KEY, c.id, COOKIE_MAX_AGE);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('acx:cart-updated', { detail: c }));
    }
  }, []);

  const addLine = useCallback(
    async (merchandiseId: string, quantity: number, attributes?: CartLineAttribute[]) => {
      const line: AddLineInput = { merchandiseId, quantity, attributes };
      const next = cart
        ? await cartLinesAdd(cart.id, [line])
        : await cartCreate([line]);
      persistCart(next);
    },
    [cart, persistCart],
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      const next = await cartLinesUpdate(cart.id, [{ id: lineId, quantity }]);
      persistCart(next);
    },
    [cart, persistCart],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      const next = await cartLinesRemove(cart.id, [lineId]);
      persistCart(next);
    },
    [cart, persistCart],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      ready,
      count: cart?.totalQuantity ?? 0,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addLine,
      updateLine,
      removeLine,
    }),
    [cart, ready, drawerOpen, addLine, updateLine, removeLine],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      'useCart must be used inside <CartProvider> — wrap the app in CartProvider in app/layout.tsx.',
    );
  }
  return ctx;
}
