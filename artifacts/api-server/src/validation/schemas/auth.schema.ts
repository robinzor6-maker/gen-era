import { z } from "zod";

export const registerBodySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().optional(),
});
