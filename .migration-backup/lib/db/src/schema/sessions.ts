import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  refreshToken: text("refresh_token").notNull().unique(),
  expiresAt:    timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Session = typeof sessionsTable.$inferSelect;
