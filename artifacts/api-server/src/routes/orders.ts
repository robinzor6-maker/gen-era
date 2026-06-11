import { Router, Request, Response } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import { getUserFromToken } from "./auth.js";
import { db, productsTable, ordersTable, orderItemsTable } from "../lib/db.js";

const router = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 46656).toString(36).toUpperCase().padStart(3, "0");
  return `GE-${ts}-${rand}`;
}

function formatOrder(
  order: typeof ordersTable.$inferSelect,
  items: (typeof orderItemsTable.$inferSelect)[]
) {
  return {
    _id: order.id,
    orderNumber: order.orderNumber,
    user: order.userId,
    customerType: order.customerType,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      city: order.customerCity,
    },
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      image: i.image,
      sku: i.sku,
      quantity: i.quantity,
      selectedSize: i.selectedSize,
      selectedColor: i.selectedColor,
    })),
    totalPrice: order.totalPrice,
    notes: order.notes,
    status: order.orderStatus,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// POST /api/v1/orders  (guest or registered)
router.post("/", async (req: Request, res: Response) => {
  const { customer, items, notes, idempotencyKey } = req.body;
  const authUser = await getUserFromToken(req);

  // ── Idempotency check — return existing order on duplicate request ─────
  if (idempotencyKey) {
    const [existing] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.idempotencyKey, idempotencyKey))
      .limit(1);
    if (existing) {
      const existingItems = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, existing.id));
      res.status(200).json({ success: true, data: formatOrder(existing, existingItems), duplicate: true });
      return;
    }
  }

  if (
    !customer?.name?.trim() ||
    !customer?.email?.trim() ||
    !customer?.address?.trim() ||
    !customer?.city?.trim()
  ) {
    res.status(400).json({ success: false, message: "Customer name, email, address and city are required." });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: "Order must contain at least one item." });
    return;
  }

  type ResolvedItem = {
    productId: string;
    name: string;
    price: number;
    image: string;
    sku: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  };

  try {
    const result = await db.transaction(async (tx) => {
      // ── 1. Resolve all products from DB (authoritative prices) ──────────
      const resolvedItems: ResolvedItem[] = [];

      for (const item of items as Array<{ productId: string; quantity: number; selectedSize?: string; selectedColor?: string }>) {
        const qty = Math.max(1, item.quantity);

        // Support lookup by DB UUID (new) OR slug (backward compat with old cart)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);

        const [product] = await tx
          .select()
          .from(productsTable)
          .where(
            and(
              isUUID
                ? eq(productsTable.id, item.productId)
                : eq(productsTable.slug, item.productId),
              eq(productsTable.active, true)
            )
          )
          .limit(1);

        if (!product) {
          throw Object.assign(new Error(`Product not found: ${item.productId}`), { status: 400 });
        }

        resolvedItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          sku: product.slug,
          quantity: qty,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        });
      }

      // ── 2. Atomic stock deduction — one row-level check per item ────────
      for (const item of resolvedItems) {
        const updated = await tx
          .update(productsTable)
          .set({ stock: sql`${productsTable.stock} - ${item.quantity}` })
          .where(
            and(
              eq(productsTable.id, item.productId),
              gte(productsTable.stock, item.quantity)
            )
          )
          .returning({ newStock: productsTable.stock });

        if (updated.length === 0) {
          throw Object.assign(
            new Error(`Insufficient stock for: ${item.name}`),
            { status: 409 }
          );
        }
      }

      // ── 3. Compute authoritative total ───────────────────────────────────
      const totalPrice = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

      // ── 4. Insert order record ───────────────────────────────────────────
      const [order] = await tx
        .insert(ordersTable)
        .values({
          orderNumber: generateOrderNumber(),
          userId: authUser?.id ?? null,
          customerType: authUser ? "registered" : "guest",
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim().toLowerCase(),
          customerPhone: customer.phone?.trim() ?? "",
          customerAddress: customer.address.trim(),
          customerCity: customer.city.trim(),
          totalPrice,
          notes: notes?.trim() ?? "",
          orderStatus: "pending",
          paymentStatus: "unpaid",
          idempotencyKey: idempotencyKey ?? null,
        })
        .returning();

      // ── 5. Insert order items ────────────────────────────────────────────
      await tx.insert(orderItemsTable).values(
        resolvedItems.map((i) => ({
          orderId: order.id,
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          sku: i.sku,
          quantity: i.quantity,
          selectedSize: i.selectedSize ?? null,
          selectedColor: i.selectedColor ?? null,
        }))
      );

      return { order, items: resolvedItems };
    });

    res.status(201).json({ success: true, data: formatOrder(result.order, result.items as any) });
  } catch (err: any) {
    const status = err?.status ?? 500;
    const message = err?.message ?? "Failed to create order.";
    if (status < 500) {
      res.status(status).json({ success: false, message });
    } else {
      throw err;
    }
  }
});

// GET /api/v1/orders  (requires auth)
router.get("/", async (req: Request, res: Response) => {
  const authUser = await getUserFromToken(req);
  if (!authUser) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const orderRows = authUser.role === "admin"
    ? await db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} DESC`)
    : await db.select().from(ordersTable).where(eq(ordersTable.userId, authUser.id));

  const result = await Promise.all(
    orderRows.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      return formatOrder(order, items);
    })
  );

  res.json({ success: true, data: result, pagination: { page: 1, limit: 50, total: result.length, pages: 1 } });
});

// GET /api/v1/orders/:id  (requires auth — owner or admin)
router.get("/:id", async (req: Request, res: Response) => {
  const authUser = await getUserFromToken(req);
  if (!authUser) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const { id } = req.params;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(isUUID ? eq(ordersTable.id, id) : eq(ordersTable.orderNumber, id))
    .limit(1);

  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  // Admins see all orders; registered users only see their own
  if (authUser.role !== "admin" && order.userId !== authUser.id) {
    res.status(403).json({ success: false, message: "Access denied." });
    return;
  }

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  res.json({ success: true, data: formatOrder(order, items) });
});

export default router;
