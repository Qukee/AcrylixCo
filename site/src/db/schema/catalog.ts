import { pgTable, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  /** 'occasion' (existing) or 'product_type'. Drives the dual-axis homepage taxonomy. */
  kind: text('kind', { enum: ['occasion', 'product_type'] })
    .notNull()
    .default('occasion'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  /** Price in cents (AUD). */
  priceCents: integer('price_cents').notNull(),
  /** Approximate width in centimetres for display. */
  widthCm: integer('width_cm').notNull(),
  /** Stock-keeping flag. */
  inStock: boolean('in_stock').notNull().default(true),
  /** Featured on the home page. */
  featured: boolean('featured').notNull().default(false),
  /** Manufacturing materials summary (denormalised for catalog display). */
  materialsSummary: text('materials_summary').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productImages = pgTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

/** Many-to-many between products and categories. */
export const productCategories = pgTable(
  'product_categories',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.productId, t.categoryId] }) }),
);

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  categories: many(productCategories),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories),
}));
