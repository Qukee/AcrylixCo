import { storefrontRequest } from './client';

// Public Cart API shapes — projected to the fields the UI actually reads.
export interface CartMoney {
  amount: string;
  currencyCode: string;
}

export interface CartLineAttribute {
  key: string;
  value: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  attributes: CartLineAttribute[];
  merchandise: {
    id: string; // ProductVariant gid
    title: string;
    price: CartMoney;
    product: {
      handle: string;
      title: string;
      featuredImage: { url: string; altText: string | null } | null;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: CartMoney;
    totalAmount: CartMoney;
  };
  lines: CartLine[];
}

export interface AddLineInput {
  merchandiseId: string; // gid://shopify/ProductVariant/...
  quantity: number;
  attributes?: CartLineAttribute[];
}

// Single fragment used by every mutation/query — keeps the response shape
// uniform so the UI doesn't care which call produced the cart.
const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        attributes {
          key
          value
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            product {
              handle
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: CartMoney;
    totalAmount: CartMoney;
  };
  lines: { nodes: CartLine[] };
}

function unwrap(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.nodes,
  };
}

function panicOnUserErrors(errors: Array<{ field: string[] | null; message: string }>): void {
  if (errors && errors.length > 0) {
    throw new Error(
      `Shopify cart: ${errors.map((e) => `${(e.field || []).join('.')}: ${e.message}`).join('; ')}`,
    );
  }
}

export async function cartCreate(initialLines: AddLineInput[] = []): Promise<Cart> {
  const data = await storefrontRequest<{
    cartCreate: { cart: RawCart; userErrors: Array<{ field: string[] | null; message: string }> };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { input: { lines: initialLines } },
  );
  panicOnUserErrors(data.cartCreate.userErrors);
  return unwrap(data.cartCreate.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefrontRequest<{ cart: RawCart | null }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      query GetCart($id: ID!) {
        cart(id: $id) {
          ...CartFields
        }
      }
    `,
    { id: cartId },
  );
  return data.cart ? unwrap(data.cart) : null;
}

export async function cartLinesAdd(
  cartId: string,
  lines: AddLineInput[],
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesAdd: {
      cart: RawCart;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lines },
  );
  panicOnUserErrors(data.cartLinesAdd.userErrors);
  return unwrap(data.cartLinesAdd.cart);
}

export async function cartLinesUpdate(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesUpdate: {
      cart: RawCart;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lines },
  );
  panicOnUserErrors(data.cartLinesUpdate.userErrors);
  return unwrap(data.cartLinesUpdate.cart);
}

export async function cartLinesRemove(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesRemove: {
      cart: RawCart;
      userErrors: Array<{ field: string[] | null; message: string }>;
    };
  }>(
    /* GraphQL */ `
      ${CART_FRAGMENT}
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ...CartFields
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { cartId, lineIds },
  );
  panicOnUserErrors(data.cartLinesRemove.userErrors);
  return unwrap(data.cartLinesRemove.cart);
}
