import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const ordersTable = pgTable("orders", {
  id:            uuid("id").primaryKey().defaultRandom(),
  orderNumber:   text("order_number").notNull().unique(),
  userId:        uuid("user_id").references(() => usersTable.id),
  customerType:  text("customer_type", { enum: ["guest", "registered"] }).notNull(),
  customerName:  text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  customerAddress: text("customer_address").notNull(),
  customerCity:  text("customer_city").notNull(),
  totalPrice:    integer("total_price").notNull(),
  notes:         text("notes").notNull().default(""),
  orderStatus:   text("order_status", {
    enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
  }).notNull().default("pending"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "paid", "refunded", "failed"],
  }).notNull().default("unpaid"),
  paymentProvider: text("payment_provider", {
    enum: ["stripe", "paymob"],
  }),
  paymentMethod: text("payment_method"),
  idempotencyKey: text("idempotency_key").unique(),
  paymentRef:    text("payment_ref"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt:     timestamp("deleted_at", { withTimezone: true }),
}, (table) => [
  index("orders_user_idx").on(table.userId),
  index("orders_email_idx").on(table.customerEmail),
  index("orders_status_idx").on(table.orderStatus),
  index("orders_payment_idx").on(table.paymentStatus),
  index("orders_provider_idx").on(table.paymentProvider),
  index("orders_created_idx").on(table.createdAt),
]);

export const orderItemsTable = pgTable("order_items", {
  id:        uuid("id").primaryKey().defaultRandom(),
  orderId:   uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name:      text("name").notNull(),
  price:     integer("price").notNull(),
  image:     text("image").notNull().default(""),
  sku:       text("sku").notNull().default(""),
  quantity:  integer("quantity").notNull().default(1),
  selectedSize:  text("selected_size"),
  selectedColor: text("selected_color"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("order_items_order_idx").on(table.orderId),
]);

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true, createdAt: true, updatedAt: true, deletedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({
  id: true, createdAt: true,
});

export const selectOrderSchema = createSelectSchema(ordersTable);

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
