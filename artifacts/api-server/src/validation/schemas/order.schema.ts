import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
});

const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  email: z.string().trim().email("Invalid customer email"),
  phone: z.string().trim().optional(),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
});

export const createOrderBodySchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().max(128).optional(),
});
