import { Router, Request, Response } from "express";
import { getUserFromToken } from "./auth";

const router = Router();

// ─── Import product catalog for price validation ──────────────────────────
// We import at runtime to avoid circular dependencies
let _products: Array<{ _id: string; slug: string; name: string; price: number; image: string; stock: number }> = [];

async function getProducts() {
  if (_products.length === 0) {
    // Dynamic import to get the products list from the products route module
    // For now we replicate the seed data to avoid circular imports
    _products = [
      { _id: "prod_001", slug: "pharaoh-cyber-hoodie", name: "PHARAOH CYBER HOODIE", price: 2800, image: "", stock: 15 },
      { _id: "prod_002", slug: "void-eye-pendant", name: "VOID EYE PENDANT", price: 950, image: "", stock: 42 },
      { _id: "prod_003", slug: "obsidian-cargo-pants", name: "OBSIDIAN CARGO PANTS", price: 1800, image: "", stock: 8 },
      { _id: "prod_004", slug: "desert-storm-cap", name: "DESERT STORM CAP", price: 650, image: "", stock: 30 },
      { _id: "prod_005", slug: "nile-fire-jacket", name: "NILE FIRE JACKET", price: 3200, image: "", stock: 5 },
      { _id: "prod_006", slug: "ankh-chain-bracelet", name: "ANKH CHAIN BRACELET", price: 480, image: "", stock: 0 },
    ];
  }
  return _products;
}

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
  phone?: string;
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
  notes?: string;
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
router.post("/", async (req: Request, res: Response) => {
  const { customer, items, notes } = req.body;
  const user = getUserFromToken(req);

  // Validation
  if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.address?.trim() || !customer?.city?.trim()) {
    res.status(400).json({ success: false, message: "Customer name, email, address and city are required." });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, message: "Order must contain at least one item." });
    return;
  }

  // Resolve prices from authoritative product catalog — never trust client-submitted prices
  const catalog = await getProducts();
  const resolvedItems: OrderItem[] = [];

  for (const item of items as Array<{ productId: string; quantity: number }>) {
    const product = catalog.find((p) => p._id === item.productId);
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
    user: user ? user._id : null,
    customerType: user ? "registered" : "guest",
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone?.trim() || "",
      address: customer.address.trim(),
      city: customer.city.trim(),
    },
    items: resolvedItems,
    totalPrice,
    notes: notes?.trim() || "",
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.push(order);
  res.status(201).json({ success: true, data: order });
});

// GET /api/v1/orders/my  (authenticated)
router.get("/my", (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }
  const myOrders = orders.filter((o) => o.user === user._id);
  res.json({ success: true, data: myOrders, pagination: { page: 1, limit: 50, total: myOrders.length, pages: 1 } });
});

// GET /api/v1/orders/:id
router.get("/:id", (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }
  const order = orders.find((o) => o._id === req.params.id);
  if (!order || (order.user !== user._id && user.role !== "admin")) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }
  res.json({ success: true, data: order });
});

export default router;
