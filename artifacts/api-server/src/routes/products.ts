import { Router } from "express";
import { and, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db, productsTable } from "../lib/db.js";

const router = Router();

type DbProduct = typeof productsTable.$inferSelect;

function formatProduct(p: DbProduct) {
  return {
    _id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    collection: p.collection,
    shortDescription: p.shortDescription,
    description: p.description,
    longDescription: p.longDescription,
    price: p.price,
    comparePrice: p.comparePrice ?? undefined,
    category: p.category,
    tags: p.tags,
    colors: (() => { try { return JSON.parse(p.colors); } catch { return []; } })(),
    sizes: p.sizes,
    image: p.image,
    gallery: p.gallery,
    modelPath: p.modelPath,
    texturePath: p.texturePath,
    material: p.material,
    weight: p.weight,
    shippingInfo: p.shippingInfo,
    stock: p.stock,
    featured: p.featured,
    active: p.active,
    rating: parseFloat(String(p.rating)),
    reviewCount: p.reviewCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function paginate<T>(arr: T[], page: number, limit: number) {
  const total = arr.length;
  const pages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  return { data: arr.slice(start, start + limit), pagination: { page, limit, total, pages } };
}

// GET /api/v1/products
router.get("/", async (req, res) => {
  const page       = Math.max(1, parseInt(String(req.query.page  ?? "1")));
  const limit      = Math.min(50, parseInt(String(req.query.limit ?? "9")));
  const category   = req.query.category   as string | undefined;
  const collection = req.query.collection as string | undefined;
  const q          = req.query.q          as string | undefined;
  const minPrice   = req.query.minPrice   ? parseInt(String(req.query.minPrice)) : undefined;
  const maxPrice   = req.query.maxPrice   ? parseInt(String(req.query.maxPrice)) : undefined;
  const inStock    = req.query.inStock === "true";

  const conditions = [eq(productsTable.active, true)];
  if (category)             conditions.push(eq(productsTable.category, category as "clothing" | "accessories"));
  if (collection)           conditions.push(eq(productsTable.collection, collection));
  if (inStock)              conditions.push(gte(productsTable.stock, 1));
  if (minPrice !== undefined) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(productsTable.price, maxPrice));
  if (q) {
    const lq = `%${q.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(productsTable.name, lq),
        ilike(productsTable.subtitle, lq),
        ilike(productsTable.description, lq),
        sql`EXISTS (SELECT 1 FROM unnest(${productsTable.tags}) t WHERE lower(t) LIKE ${lq})`
      )!
    );
  }

  const rows = await db.select().from(productsTable).where(and(...conditions));
  const formatted = rows.map(formatProduct);
  const result = paginate(formatted, page, limit);
  res.json({ success: true, ...result });
});

// GET /api/v1/products/featured
router.get("/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.active, true), eq(productsTable.featured, true)));
  const data = rows.map(formatProduct);
  res.json({ success: true, data, pagination: { page: 1, limit: 10, total: data.length, pages: 1 } });
});

// GET /api/v1/products/search
router.get("/search", async (req, res) => {
  const q     = String(req.query.q ?? "").toLowerCase();
  const page  = Math.max(1, parseInt(String(req.query.page  ?? "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit ?? "9")));

  const lq = `%${q}%`;
  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.active, true),
        or(
          ilike(productsTable.name, lq),
          ilike(productsTable.description, lq),
          sql`EXISTS (SELECT 1 FROM unnest(${productsTable.tags}) t WHERE lower(t) LIKE ${lq})`
        )
      )
    );
  const formatted = rows.map(formatProduct);
  res.json({ success: true, ...paginate(formatted, page, limit) });
});

// GET /api/v1/products/category/:category
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  const page  = Math.max(1, parseInt(String(req.query.page  ?? "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit ?? "9")));

  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.active, true), eq(productsTable.category, category as "clothing" | "accessories")));
  const formatted = rows.map(formatProduct);
  res.json({ success: true, ...paginate(formatted, page, limit) });
});

// GET /api/v1/products/:slug
router.get("/:slug", async (req, res) => {
  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.slug, req.params.slug), eq(productsTable.active, true)))
    .limit(1);

  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }
  res.json({ success: true, data: formatProduct(product) });
});

export { formatProduct };
export default router;
