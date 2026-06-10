import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionsTable = pgTable("collections", {
  id:           uuid("id").primaryKey().defaultRandom(),
  slug:         text("slug").notNull().unique(),
  name:         text("name").notNull(),
  description:  text("description").notNull().default(""),
  season:       text("season").notNull().default(""),
  year:         integer("year").notNull().default(2025),
  coverGlyph:   text("cover_glyph").notNull().default("𓂀"),
  coverImage:   text("cover_image").default("").notNull(),
  active:       boolean("active").notNull().default(true),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt:    timestamp("deleted_at", { withTimezone: true }),
});

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const selectCollectionSchema = createSelectSchema(collectionsTable);

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;
