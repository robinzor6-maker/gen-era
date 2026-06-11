import { pgTable, uuid, text, integer, timestamp, boolean, index } from "drizzle-orm/pg-core";

export const artifactViewsTable = pgTable("artifact_views", {
  id:           uuid("id").primaryKey().defaultRandom(),
  artifactId:   text("artifact_id").notNull(),
  artifactName: text("artifact_name").notNull(),
  collection:   text("collection").notNull().default(""),
  district:     text("district").notNull().default("gencore"),
  sessionId:    text("session_id").notNull().default(""),
  viewedAt:     timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("av_artifact_idx").on(t.artifactId),
  index("av_viewed_idx").on(t.viewedAt),
]);

export const artifactChamberVisitsTable = pgTable("artifact_chamber_visits", {
  id:           uuid("id").primaryKey().defaultRandom(),
  artifactId:   text("artifact_id").notNull(),
  artifactName: text("artifact_name").notNull(),
  collection:   text("collection").notNull().default(""),
  district:     text("district").notNull().default("gencore"),
  sessionId:    text("session_id").notNull().default(""),
  visitedAt:    timestamp("visited_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("acv_artifact_idx").on(t.artifactId),
  index("acv_visited_idx").on(t.visitedAt),
]);

export const artifactClaimsTable = pgTable("artifact_claims", {
  id:           uuid("id").primaryKey().defaultRandom(),
  artifactId:   text("artifact_id").notNull(),
  artifactName: text("artifact_name").notNull(),
  collection:   text("collection").notNull().default(""),
  district:     text("district").notNull().default("gencore"),
  priceCents:   integer("price_cents").notNull().default(0),
  converted:    boolean("converted").notNull().default(false),
  sessionId:    text("session_id").notNull().default(""),
  claimedAt:    timestamp("claimed_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("ac_artifact_idx").on(t.artifactId),
  index("ac_claimed_idx").on(t.claimedAt),
  index("ac_converted_idx").on(t.converted),
]);
