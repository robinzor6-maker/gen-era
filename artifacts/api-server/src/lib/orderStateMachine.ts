/**
 * Order State Machine — enforces valid status transitions.
 * Any attempt to move to a state not listed as a successor is rejected.
 *
 * ORDER STATUS transitions:
 *   pending → paid | cancelled
 *   paid    → shipped | cancelled
 *   shipped → delivered
 *   delivered → (terminal)
 *   cancelled → (terminal)
 *   processing → paid | shipped | cancelled  (intermediate, set by webhooks)
 *
 * PAYMENT STATUS transitions:
 *   unpaid → paid | failed
 *   failed → paid          (retry allowed)
 *   paid   → refunded
 *   refunded → (terminal)
 */

export type OrderStatus = "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

const ORDER_SUCCESSORS: Record<OrderStatus, OrderStatus[]> = {
  pending:    ["paid", "processing", "cancelled"],
  processing: ["paid", "shipped", "cancelled"],
  paid:       ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

const PAYMENT_SUCCESSORS: Record<PaymentStatus, PaymentStatus[]> = {
  unpaid:   ["paid", "failed"],
  failed:   ["paid"],
  paid:     ["refunded"],
  refunded: [],
};

export function isValidOrderTransition(from: string, to: string): boolean {
  const successors = ORDER_SUCCESSORS[from as OrderStatus];
  if (!successors) return false;
  return successors.includes(to as OrderStatus);
}

export function isValidPaymentTransition(from: string, to: string): boolean {
  const successors = PAYMENT_SUCCESSORS[from as PaymentStatus];
  if (!successors) return false;
  return successors.includes(to as PaymentStatus);
}

export function assertOrderTransition(from: string, to: string): void {
  if (!isValidOrderTransition(from, to)) {
    const err = new Error(`Invalid order status transition: ${from} → ${to}`);
    (err as any).status = 422;
    throw err;
  }
}

export function assertPaymentTransition(from: string, to: string): void {
  if (!isValidPaymentTransition(from, to)) {
    const err = new Error(`Invalid payment status transition: ${from} → ${to}`);
    (err as any).status = 422;
    throw err;
  }
}
