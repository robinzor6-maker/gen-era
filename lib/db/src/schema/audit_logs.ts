import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const auditLogsTable = pgTable("audit_logs", {
  id:         uuid("id").primaryKey().defaultRandom(),
  adminId:    uuid("admin_id").references(() => usersTable.id),
  adminEmail: text("admin_email").notNull(),
  action:     text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId:   text("target_id").notNull(),
  before:     jsonb("before"),
  after:      jsonb("after"),
  ip:         text("ip"),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("audit_logs_admin_idx").on(table.adminId),
  index("audit_logs_target_idx").on(table.targetId),
  index("audit_logs_action_idx").on(table.action),
  index("audit_logs_created_idx").on(table.createdAt),
]);

export type AuditLog = typeof auditLogsTable.$inferSelect;
export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
