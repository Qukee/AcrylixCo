/**
 * TypeScript types for Shopify Storefront API responses. Only covers the
 * fields we actually query — extend as new fields appear in queries.
 *
 * Schema reference: https://shopify.dev/docs/api/storefront/latest
 */

export interface ShopifyMoney {
  amount: string; // decimal string, e.g. "72.00"
  currencyCode: string; // e.g. "AUD"
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ShopifyVariant {
  id: string; // gid://shopify/ProductVariant/...
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
}

export interface ShopifyProduct {
  id: string; // gid://shopify/Product/...
  handle: string; // slug, e.g. "olivia-circular-frame"
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: {
    nodes: ShopifyImage[];
  };
  variants: {
    nodes: ShopifyVariant[];
  };
  // Custom metadata fields we'll attach to each product:
  //   materialsSummary (single line, mono caption on PDP)
  //   widthCm (number, used in PDP subtitle)
  // Surfaced via the `metafields` array on the product query.
  metafields: Array<{ key: string; value: string } | null>;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
}

export interface ShopifyCartLineAttribute {
  key: string;
  value: string;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  attributes: ShopifyCartLineAttribute[];
  merchandise: {
    id: string;
    title: string;
    product: {
      handle: string;
      title: string;
      featuredImage: ShopifyImage | null;
    };
    price: ShopifyMoney;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
}
