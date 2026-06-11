import { z } from "zod";

export const createProductBodySchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  shortDescription: z.string().max(200).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  longDescription: z.string().optional(),
  price: z.number().int().positive("Price must be a positive integer (in piastres/cents)"),
  comparePrice: z.number().int().positive().optional(),
  category: z.enum(["clothing", "accessories"]),
  image: z.string().url("Image must be a valid URL").optional().default(""),
  stock: z.number().int().nonnegative("Stock must be 0 or more"),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export const updateProductBodySchema = createProductBodySchema.partial().omit({ slug: true });

export const inventoryBodySchema = z.object({
  stock: z.number().int().nonnegative("Stock must be 0 or more"),
});

const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "failed"] as const;

export const updateOrderStatusBodySchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
}).refine((d) => d.orderStatus || d.paymentStatus, {
  message: "At least one of orderStatus or paymentStatus is required",
});

export const updateUserRoleBodySchema = z.object({
  role: z.enum(["user", "admin"]),
});
