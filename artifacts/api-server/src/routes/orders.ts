import { Router, Request, Response } from "express";
import { getUserFromToken } from "./auth";

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
router.post("/", (req: Request, res: Response) => {
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

  // Calculate total from submitted items (in production you'd verify against DB prices)
  const resolvedItems: OrderItem[] = items.map((item: { productId: string; quantity: number }) => ({
    productId: item.productId,
    name: `Product ${item.productId}`,
    price: 0, // Would look up from DB in production
    image: "",
    sku: item.productId,
    quantity: item.quantity,
  }));

  // In a real app: look up actual prices. For now accept any submitted total.
  // We compute a rough total based on what we know.
  const totalPrice = resolvedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

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
