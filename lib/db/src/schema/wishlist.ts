import { pgTable, uuid, text, timestamp, unique, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const wishlistItemsTable = pgTable("wishlist_items", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("wishlist_user_product_unique").on(table.userId, table.productId),
  index("wishlist_user_idx").on(table.userId),
]);

export type WishlistItem = typeof wishlistItemsTable.$inferSelect;
