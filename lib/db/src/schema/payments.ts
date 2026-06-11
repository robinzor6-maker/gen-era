import { pgTable, uuid, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";

export const paymentsTable = pgTable("payments", {
  id:            uuid("id").primaryKey().defaultRandom(),
  orderId:       uuid("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  provider:      text("provider", { enum: ["stripe", "paymob"] }).notNull(),
  status:        text("status", { enum: ["initiated", "success", "failed"] }).notNull().default("initiated"),
  amount:        integer("amount").notNull(),
  transactionId: text("transaction_id"),
  rawResponse:   jsonb("raw_response"),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("payments_order_idx").on(table.orderId),
  index("payments_status_idx").on(table.status),
  index("payments_provider_idx").on(table.provider),
]);

export type Payment = typeof paymentsTable.$inferSelect;
export type InsertPayment = typeof paymentsTable.$inferInsert;
