import { z } from "zod";

export const postCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).optional(),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
});

export const deleteCartSchema = z.object({
  productId: z.string().uuid(),
});
