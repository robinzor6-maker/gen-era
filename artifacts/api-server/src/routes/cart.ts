import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable, cartItemsTable } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../validation/validateRequest.js";
import { z } from "zod";

const router = Router();

const postBodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).optional(),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
});

// GET /api/v1/cart
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user!.id;
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  const enriched = await Promise.all(items.map(async (it) => {
    const [prod] = await db
      .select({ id: productsTable.id, name: productsTable.name, price: productsTable.price, image: productsTable.image, slug: productsTable.slug })
      .from(productsTable)
      .where(eq(productsTable.id, it.productId))
      .limit(1);

    return {
      id: it.id,
      productId: it.productId,
      quantity: it.quantity,
      selectedSize: it.selectedSize || undefined,
      selectedColor: it.selectedColor || undefined,
      addedAt: it.addedAt,
      product: prod ?? null,
    };
  }));

  res.json({ success: true, items: enriched });
});

// POST /api/v1/cart
router.post("/", requireAuth, validateBody(postBodySchema), async (req: Request, res: Response) => {
  const userId = (req as any).user!.id;
  const { productId, quantity = 1, selectedSize = "", selectedColor = "" } = req.body;

  // Check existing
  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, userId))
    .where(eq(cartItemsTable.productId, productId))
    .limit(1);

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db
      .insert(cartItemsTable)
      .values({ userId, productId, quantity, selectedSize, selectedColor });
  }

  const [item] = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.userId, userId))
    .where(eq(cartItemsTable.productId, productId))
    .limit(1);

  res.status(201).json({ success: true, item });
});

// DELETE /api/v1/cart?productId=...
router.delete("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user!.id;
  const productId = String(req.query.productId || "");
  if (!productId) {
    res.status(400).json({ success: false, message: "productId query parameter required" });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.userId, userId))
    .where(eq(cartItemsTable.productId, productId));

  res.json({ success: true });
});

export default router;
