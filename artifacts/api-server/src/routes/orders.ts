import { Router, Request, Response } from "express";
import { getUserFromToken } from "./auth";
import { products } from "./products";

const router = Router();

// ─── In-memory order store ────────────────────────────────────────────────
interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  sku: string;
  quantity: number;
}

interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: string | null;
  customerType: "guest" | "registered";
  customer: OrderCustomer;
  items: OrderItem[];
  totalPrice: number;
  notes: string;
  status: "pending" | "paid" | "shipped" | "delivered";
  paymentStatus: "unpaid" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
}

const orders: Order[] = [];

function generateOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

// POST /api/v1/orders  (guest or registered)
router.post("/", (req: Request, res: Response) => {
  const { customer, items, notes } = req.body;
  const user = getUserFromToken(req);

  if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.address?.trim() || !customer?.city?.trim()) {
    res.status(400).json({ success: false, message: "Customer name, email, address and city are required." });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: "Order must contain at least one item." });
    return;
  }

  // Resolve prices from authoritative product catalog — never trust client-submitted prices
  const resolvedItems: OrderItem[] = [];

  for (const item of items as Array<{ productId: string; quantity: number }>) {
    const product = products.find((p) => p._id === item.productId);
    if (!product) {
      res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
      return;
    }
    resolvedItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      sku: product.slug,
      quantity: Math.max(1, item.quantity),
    });
  }

  // Compute authoritative total from server-side prices
  const totalPrice = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order: Order = {
    _id: `order_${Date.now()}`,
    orderNumber: generateOrderNumber(),
    user: user?._id ?? null,
    customerType: user ? "registered" : "guest",
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone?.trim() ?? "",
      address: customer.address.trim(),
      city: customer.city.trim(),
    },
    items: resolvedItems,
    totalPrice,
    notes: notes?.trim() ?? "",
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);

  res.status(201).json({ success: true, data: order });
});

// GET /api/v1/orders  (requires auth)
router.get("/", (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const userOrders = user.role === "admin"
    ? orders
    : orders.filter((o) => o.user === user._id);

  res.json({
    success: true,
    data: userOrders,
    pagination: { page: 1, limit: 50, total: userOrders.length, pages: 1 },
  });
});

// GET /api/v1/orders/:id
router.get("/:id", (req: Request, res: Response) => {
  const order = orders.find((o) => o._id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }
  res.json({ success: true, data: order });
});

export default router;
