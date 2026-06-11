import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "../lib/db.js";
import { PaymentService } from "../services/paymentService.js";
import { getUserFromToken } from "./auth.js";

const router = Router();

// POST /api/v1/payments/create-intent
// Creates a Stripe PaymentIntent for an existing pending order.
router.post("/create-intent", async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ success: false, message: "orderId is required." });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!order) {
    res.status(404).json({ success: false, message: "Order not found." });
    return;
  }

  if (order.paymentStatus === "paid") {
    res.status(409).json({ success: false, message: "Order is already paid." });
    return;
  }

  const authUser = await getUserFromToken(req);
  if (order.userId && (!authUser || authUser.id !== order.userId)) {
    res.status(403).json({ success: false, message: "Not authorized to pay for this order." });
    return;
  }

  try {
    const currency = (order as any).currency ?? "usd";
    const intent = await PaymentService.createPaymentIntent(
      order.totalPrice,
      currency,
      order.id,
      order.orderNumber
    );

    await db
      .update(ordersTable)
      .set({ stripePaymentIntentId: intent.id })
      .where(eq(ordersTable.id, order.id));

    res.json({
      success: true,
      data: {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: intent.amount,
        currency: intent.currency,
      },
    });
  } catch (err: any) {
    if (err?.message?.includes("STRIPE_SECRET_KEY")) {
      res.status(503).json({ success: false, message: "Payment service is not configured." });
    } else {
      throw err;
    }
  }
});

export default router;
