import { z } from "zod";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const initiatePaymentSchema = z.object({
  orderId: z
    .string({ required_error: "orderId is required" })
    .regex(UUID_RE, "orderId must be a valid UUID"),
  provider: z.enum(["stripe", "paymob", "cod"]).optional(),
  country: z.string().length(2).optional(),
  idempotencyKey: z.string().max(128).optional(),
});

export const checkoutPaymentSchema = z.object({
  orderId: z
    .string({ required_error: "orderId is required" })
    .regex(UUID_RE, "orderId must be a valid UUID"),
  provider: z.enum(["stripe", "paymob"]).optional(),
});

export const createIntentSchema = z.object({
  orderId: z
    .string({ required_error: "orderId is required" })
    .regex(UUID_RE, "orderId must be a valid UUID"),
});
