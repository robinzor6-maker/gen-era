import { pgTable, uuid, integer, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const cartItemsTable = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => productsTable.id),
  quantity: integer("quantity").notNull().default(1),
  selectedSize: text("selected_size").default("").notNull(),
  selectedColor: text("selected_color").default("").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, addedAt: true });
export const selectCartItemSchema = createSelectSchema(cartItemsTable);

export type CartItem = typeof cartItemsTable.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
