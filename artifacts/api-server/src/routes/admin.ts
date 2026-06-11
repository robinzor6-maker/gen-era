import { Router, type Response } from "express";
import { eq, desc, sql, count, sum } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";
import { db, productsTable, ordersTable, orderItemsTable, usersTable } from "../lib/db.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

// ── GET /api/v1/admin/stats ──────────────────────────────────────────────
router.get("/stats", async (_req: AuthRequest, res: Response) => {
  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [orderCount] = await db.select({ count: count() }).from(ordersTable);
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [revenue] = await db
    .select({ total: sum(ordersTable.totalPrice) })
    .from(ordersTable)
    .where(eq(ordersTable.paymentStatus, "paid"));

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  res.json({
    success: true,
    data: {
      products: productCount.count,
      orders: orderCount.count,
      users: userCount.count,
      revenue: revenue.total ?? 0,
      recentOrders,
    },
  });
});

// ── PRODUCTS ─────────────────────────────────────────────────────────────

router.get("/products", async (_req: AuthRequest, res: Response) => {
  const rows = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  res.json({ success: true, data: rows });
});

router.post("/products", async (req: AuthRequest, res: Response) => {
  const body = req.body;
  const [product] = await db.insert(productsTable).values(body).returning();
  res.status(201).json({ success: true, data: product });
});

router.put("/products/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { id: _id, createdAt: _c, ...updates } = req.body;
  const [product] = await db
    .update(productsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(productsTable.id, id))
    .returning();
  if (!product) { res.status(404).json({ success: false, message: "Product not found." }); return; }
  res.json({ success: true, data: product });
});

router.delete("/products/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await db.update(productsTable).set({ active: false }).where(eq(productsTable.id, id));
  res.json({ success: true });
});

// ── INVENTORY ────────────────────────────────────────────────────────────

router.patch("/inventory/:productId", async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { stock } = req.body;
  if (typeof stock !== "number" || stock < 0) {
    res.status(400).json({ success: false, message: "stock must be a non-negative number." });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set({ stock, updatedAt: new Date() })
    .where(eq(productsTable.id, productId))
    .returning({ id: productsTable.id, name: productsTable.name, stock: productsTable.stock });
  if (!product) { res.status(404).json({ success: false, message: "Product not found." }); return; }
  res.json({ success: true, data: product });
});

// ── ORDERS ───────────────────────────────────────────────────────────────

router.get("/orders", async (_req: AuthRequest, res: Response) => {
  const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json({ success: true, data: rows });
});

router.patch("/orders/:id/status", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (orderStatus) updates.orderStatus = orderStatus;
  if (paymentStatus) updates.paymentStatus = paymentStatus;

  const [order] = await db
    .update(ordersTable)
    .set(updates)
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }
  res.json({ success: true, data: order });
});

// ── USERS ────────────────────────────────────────────────────────────────

router.get("/users", async (_req: AuthRequest, res: Response) => {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isVerified: usersTable.isVerified,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(sql`${usersTable.deletedAt} IS NULL`)
    .orderBy(desc(usersTable.createdAt));
  res.json({ success: true, data: rows });
});

router.patch("/users/:id/role", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (role !== "user" && role !== "admin") {
    res.status(400).json({ success: false, message: "role must be 'user' or 'admin'." });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ role, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role });
  if (!user) { res.status(404).json({ success: false, message: "User not found." }); return; }
  res.json({ success: true, data: user });
});

export default router;
