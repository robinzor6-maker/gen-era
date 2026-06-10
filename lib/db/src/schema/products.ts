import { pgTable, uuid, text, integer, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id:               uuid("id").primaryKey().defaultRandom(),
  slug:             text("slug").notNull().unique(),
  name:             text("name").notNull(),
  subtitle:         text("subtitle").notNull().default(""),
  collection:       text("collection").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  description:      text("description").notNull().default(""),
  longDescription:  text("long_description").default(""),
  price:            integer("price").notNull(),
  comparePrice:     integer("compare_price"),
  category:         text("category", { enum: ["clothing", "accessories"] }).notNull(),
  tags:             text("tags").array().notNull().default([]),
  colors:           text("colors").notNull().default("[]"),
  sizes:            text("sizes").array().notNull().default([]),
  image:            text("image").notNull().default(""),
  gallery:          text("gallery").array().notNull().default([]),
  modelPath:        text("model_path").notNull().default(""),
  texturePath:      text("texture_path").default(""),
  material:         text("material").default(""),
  weight:           text("weight").default(""),
  shippingInfo:     text("shipping_info").default(""),
  stock:            integer("stock").notNull().default(0),
  featured:         boolean("featured").notNull().default(false),
  active:           boolean("active").notNull().default(true),
  rating:           numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviewCount:      integer("review_count").notNull().default(0),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt:        timestamp("deleted_at", { withTimezone: true }),
}, (table) => [
  index("products_category_idx").on(table.category),
  index("products_collection_idx").on(table.collection),
  index("products_featured_idx").on(table.featured),
  index("products_active_idx").on(table.active),
  index("products_price_idx").on(table.price),
]);

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const selectProductSchema = createSelectSchema(productsTable);

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
