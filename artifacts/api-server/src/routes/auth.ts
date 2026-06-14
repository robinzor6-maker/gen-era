import { Router, type Request, type Response } from "express";
import { hash, compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { z } from "zod/v4";
import { db } from "../lib/db.js";
import { usersTable } from "../lib/db.js";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import type { JWTPayload } from "../middleware/auth.js";

const router = Router();

// SECURITY NOTE: Redis would be production-grade; this implements in-memory blocklist for refresh tokens
const refreshTokenBlocklist = new Set<string>();

// ── Schemas ───────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

// ── Token Generation ──────────────────────────────────────────────────────────
const generateAccessToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  
  return sign(payload, secret, { expiresIn: "15m" });
};

const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");
  
  return sign({ userId }, secret, { expiresIn: "7d" });
};

const verifyRefreshToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET not configured");
  
  return verify(token, secret) as { userId: string };
};

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ success: false, message: "Email already registered" });
      return;
    }

    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
    const passwordHash = await hash(data.password, bcryptRounds);

    const [user] = await db
      .insert(usersTable)
      .values({
        email: data.email,
        passwordHash,
        role: "customer",
      })
      .returning();

    if (!user) {
      res.status(500).json({ success: false, message: "Failed to create user" });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as "admin" | "customer",
    });

    const refreshToken = generateRefreshToken(user.id);

    logger.info({ userId: user.id, email: user.email }, "User registered");

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0].message });
    } else {
      logger.error({ err }, "Registration error");
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    if (!user) {
      // SECURITY NOTE: Generic message prevents email enumeration attacks
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const isValid = await compare(data.password, user.passwordHash);

    if (!isValid) {
      res.status(401).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as "admin" | "customer",
    });

    const refreshToken = generateRefreshToken(user.id);

    logger.info({ userId: user.id }, "User logged in");

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0].message });
    } else {
      logger.error({ err }, "Login error");
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
});

// ── POST /auth/refresh ────────────────────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = refreshSchema.parse(req.body);

    if (refreshTokenBlocklist.has(data.refreshToken)) {
      res.status(401).json({ success: false, message: "Token has been revoked" });
      return;
    }

    const payload = verifyRefreshToken(data.refreshToken);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as "admin" | "customer",
    });

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0].message });
    } else {
      res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }
  }
});

// ── POST /auth/logout ─────────────────────────────────────────────────────────
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = refreshSchema.parse(req.body);

    // SECURITY NOTE: Add to blocklist to prevent token reuse; production should use Redis with TTL
    refreshTokenBlocklist.add(data.refreshToken);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: err.errors[0].message });
    } else {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
});

export default router;

