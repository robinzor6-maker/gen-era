import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, collectionsTable, productsTable } from "../lib/db.js";

const router = Router();

type DbCollection = typeof collectionsTable.$inferSelect;

function formatCollection(c: DbCollection, productCount: number) {
  return {
    _id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    season: c.season,
    year: c.year,
    coverGlyph: c.coverGlyph,
    coverImage: c.coverImage,
    active: c.active,
    productCount,
    createdAt: c.createdAt,
  };
}

// GET /api/v1/collections
router.get("/", async (_req, res) => {
  const collections = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.active, true));

  const enriched = await Promise.all(
    collections.map(async (c) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(productsTable)
        .where(
          and(
            eq(productsTable.active, true),
            eq(productsTable.collection, c.slug)
          )
        );
      return formatCollection(c, count);
    })
  );

  res.json({ success: true, data: enriched });
});

// GET /api/v1/collections/:slug
router.get("/:slug", async (req, res) => {
  const [collection] = await db
    .select()
    .from(collectionsTable)
    .where(
      and(
        eq(collectionsTable.slug, req.params.slug),
        eq(collectionsTable.active, true)
      )
    )
    .limit(1);

  if (!collection) {
    res.status(404).json({ success: false, message: "Collection not found" });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.active, true),
        eq(productsTable.collection, collection.slug)
      )
    );

  res.json({
    success: true,
    data: {
      ...formatCollection(collection, products.length),
      products: products.map((p) => ({
        _id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.image,
        stock: p.stock,
        featured: p.featured,
      })),
    },
  });
});

export default router;
