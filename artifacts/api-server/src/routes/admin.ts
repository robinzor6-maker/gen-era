import { Router, type Request, type Response } from "express";
import { and, or, eq, desc, ilike, gte, lte, count, sum } from "drizzle-orm";
import { authenticate, requireRole, type AuthRequest } from "../middleware/auth.js";
import {
  db,
  productsTable,
  ordersTable,
  orderItemsTable,
  paymentsTable,
  auditLogsTable,
  usersTable,
} from "../lib/db.js";
import {
  validateBody,
  createProductBodySchema,
  updateProductBodySchema,
  inventoryBodySchema,
  updateOrderStatusBodySchema,
  updateUserRoleBodySchema,
} from "../validation/index.js";
import {
  isValidOrderTransition,
  isValidPaymentTransition,
} from "../lib/orderStateMachine.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.use(authenticate);
router.use(requireRole("admin"));

// ── Audit logging helper ──────────────────────────────────────────────────────
async function logAudit(
  req: AuthRequest,
  action: string,
  targetType: string,
  targetId: string,
  before?: unknown,
  after?: unknown
) {
  const adminId    = req.user?.id ?? null;
  const adminEmail = req.user?.email ?? "unknown";
  const ip         = req.ip ?? "unknown";
  await db
    .insert(auditLogsTable)
    .values({ adminId, adminEmail, action, targetType, targetId, before: before as any ?? null, after: after as any ?? null, ip })
    .catch((err) => logger.error(err, "Failed to write audit log"));
}

// ── GET /api/v1/admin/stats ──────────────────────────────────────────────────
router.get("/stats", async (_req: AuthRequest, res: Response) => {
  const [productCount] = await db.select({ count: count() }).from(productsTable);
  const [orderCount]   = await db.select({ count: count() }).from(ordersTable);
  const [userCount]    = await db.select({ count: count() }).from(usersTable);
  const [revenue]      = await db
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
    data: { products: productCount.count, orders: orderCount.count, users: userCount.count, revenue: revenue.total ?? 0, recentOrders },
  });
});

// ── GET /api/v1/admin/orders  (with filters) ─────────────────────────────────
// Query params: status, paymentStatus, provider, search, from, to, limit, page
router.get("/orders", async (req: AuthRequest, res: Response) => {
  const { status, paymentStatus, provider, search, from, to } = req.query;
  const limit  = Math.min(parseInt((req.query.limit as string) || "100", 10), 500);
  const page   = Math.max(parseInt((req.query.page  as string) || "1",   10), 1);
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (status)        conditions.push(eq(ordersTable.orderStatus,   status        as string));
  if (paymentStatus) conditions.push(eq(ordersTable.paymentStatus, paymentStatus as string));
  if (provider)      conditions.push(eq(ordersTable.paymentProvider, provider    as any));
  if (from)          conditions.push(gte(ordersTable.createdAt, new Date(from    as string)));
  if (to) {
    const toDate = new Date(to as string);
    toDate.setHours(23, 59, 59, 999);
    conditions.push(lte(ordersTable.createdAt, toDate));
  }
  if (search) {
    const s = `%${search}%`;
    conditions.push(
      or(
        ilike(ordersTable.customerName,  s),
        ilike(ordersTable.customerEmail, s),
        ilike(ordersTable.orderNumber,   s),
        ilike(ordersTable.customerPhone, s),
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(ordersTable).where(where),
  ]);

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
  });
});

// ── GET /api/v1/admin/orders/:id  (full detail with items + payment history) ─
router.get("/orders/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

  const [items, payments, auditEntries] = await Promise.all([
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id)),
    db.select().from(paymentsTable).where(eq(paymentsTable.orderId, id)).orderBy(desc(paymentsTable.createdAt)),
    db.select().from(auditLogsTable).where(eq(auditLogsTable.targetId, id)).orderBy(desc(auditLogsTable.createdAt)).limit(20),
  ]);

  res.json({ success: true, data: { ...order, items, payments, auditLog: auditEntries } });
});

// ── PATCH /api/v1/admin/orders/:id/status  (state machine enforced + audit) ──
router.patch(
  "/orders/:id/status",
  validateBody(updateOrderStatusBodySchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const [order] = await db
      .select({ id: ordersTable.id, orderStatus: ordersTable.orderStatus, paymentStatus: ordersTable.paymentStatus })
      .from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
    if (!order) { res.status(404).json({ success: false, message: "Order not found." }); return; }

    if (orderStatus && orderStatus !== order.orderStatus) {
      if (!isValidOrderTransition(order.orderStatus, orderStatus)) {
        res.status(422).json({
          success: false,
          message: `Invalid order status transition: ${order.orderStatus} → ${orderStatus}`,
          code: "INVALID_TRANSITION",
          allowedNext: getAllowedOrderTransitions(order.orderStatus),
        });
        return;
      }
    }
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      if (!isValidPaymentTransition(order.paymentStatus, paymentStatus)) {
        res.status(422).json({
          success: false,
          message: `Invalid payment status transition: ${order.paymentStatus} → ${paymentStatus}`,
          code: "INVALID_TRANSITION",
          allowedNext: getAllowedPaymentTransitions(order.paymentStatus),
        });
        return;
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (orderStatus)   updates.orderStatus   = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();

    await logAudit(req, "order.status.update", "order", id,
      { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus },
      { orderStatus: updated.orderStatus, paymentStatus: updated.paymentStatus }
    );
    logger.info({ orderId: id, orderStatus, paymentStatus, admin: req.user?.email }, "Admin: order status updated");

    res.json({ success: true, data: updated });
  }
);

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

router.get("/products", async (_req: AuthRequest, res: Response) => {
  const rows = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  res.json({ success: true, data: rows });
});

router.post("/products", validateBody(createProductBodySchema), async (req: AuthRequest, res: Response) => {
  const [product] = await db.insert(productsTable).values(req.body).returning();
  await logAudit(req, "product.create", "product", product.id, null, req.body);
  res.status(201).json({ success: true, data: product });
});

router.put("/products/:id", validateBody(updateProductBodySchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const [before] = await db.select({ name: productsTable.name, price: productsTable.price, active: productsTable.active }).from(productsTable).where(eq(productsTable.id, id)).limit(1);
  const { id: _id, createdAt: _c, ...updates } = req.body;
  const [product] = await db.update(productsTable).set({ ...updates, updatedAt: new Date() }).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ success: false, message: "Product not found." }); return; }
  await logAudit(req, "product.update", "product", id, before, updates);
  res.json({ success: true, data: product });
});

router.delete("/products/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await db.update(productsTable).set({ active: false }).where(eq(productsTable.id, id));
  await logAudit(req, "product.deactivate", "product", id, { active: true }, { active: false });
  res.json({ success: true });
});

// ── INVENTORY ─────────────────────────────────────────────────────────────────

router.patch("/inventory/:productId", validateBody(inventoryBodySchema), async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { stock } = req.body;
  const [before] = await db.select({ stock: productsTable.stock }).from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  const [product] = await db
    .update(productsTable).set({ stock, updatedAt: new Date() }).where(eq(productsTable.id, productId))
    .returning({ id: productsTable.id, name: productsTable.name, stock: productsTable.stock });
  if (!product) { res.status(404).json({ success: false, message: "Product not found." }); return; }
  await logAudit(req, "inventory.update", "product", productId, { stock: before?.stock }, { stock });
  res.json({ success: true, data: product });
});

// ── USERS ─────────────────────────────────────────────────────────────────────

router.get("/users", async (_req: AuthRequest, res: Response) => {
  const rows = await db
    .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, isVerified: usersTable.isVerified, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.deletedAt as any, null))
    .orderBy(desc(usersTable.createdAt));
  res.json({ success: true, data: rows });
});

router.patch("/users/:id/role", validateBody(updateUserRoleBodySchema), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const [before] = await db.select({ role: usersTable.role, email: usersTable.email }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
  const [user] = await db.update(usersTable).set({ role, updatedAt: new Date() }).where(eq(usersTable.id, id))
    .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role });
  if (!user) { res.status(404).json({ success: false, message: "User not found." }); return; }
  await logAudit(req, "user.role.update", "user", id, { role: before?.role }, { role });
  res.json({ success: true, data: user });
});

// ── AUDIT LOGS ────────────────────────────────────────────────────────────────

router.get("/audit-logs", async (req: AuthRequest, res: Response) => {
  const { targetId, targetType, action } = req.query;
  const limit  = Math.min(parseInt((req.query.limit  as string) || "100", 10), 500);
  const page   = Math.max(parseInt((req.query.page   as string) || "1",   10), 1);
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (targetId)   conditions.push(eq(auditLogsTable.targetId,   targetId   as string));
  if (targetType) conditions.push(eq(auditLogsTable.targetType, targetType as string));
  if (action)     conditions.push(eq(auditLogsTable.action,     action     as string));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(auditLogsTable).where(where).orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(auditLogsTable).where(where),
  ]);

  res.json({ success: true, data: rows, pagination: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) } });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAllowedOrderTransitions(from: string): string[] {
  const map: Record<string, string[]> = {
    pending: ["paid", "processing", "cancelled"], processing: ["paid", "shipped", "cancelled"],
    paid: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [],
  };
  return map[from] ?? [];
}

function getAllowedPaymentTransitions(from: string): string[] {
  const map: Record<string, string[]> = {
    unpaid: ["paid", "failed"], failed: ["paid"], paid: ["refunded"], refunded: [],
  };
  return map[from] ?? [];
}

export default router;
