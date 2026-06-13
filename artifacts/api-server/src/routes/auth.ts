import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { AuthService } from "../services/authService.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { db, usersTable } from "../lib/db.js";
import { validateBody, registerBodySchema, loginBodySchema, refreshBodySchema, logoutBodySchema } from "../validation/index.js";

const router = Router();

type DbUser = typeof usersTable.$inferSelect;

function safeUser(user: DbUser) {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

// ── Shared helper: decode Bearer JWT → DB user (used by orders.ts) ─────────
export async function getUserFromToken(req: Request): Promise<DbUser | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const payload = AuthService.verifyAccessToken(token);
  if (!payload) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId))
    .limit(1);
  return user ?? null;
}

// ── POST /api/v1/auth/register ──────────────────────────────────────────────
router.post("/register", validateBody(registerBodySchema), async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  if (existing) {
    res.status(409).json({ success: false, message: "Email already registered." });
    return;
  }

  const passwordHash = await AuthService.hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({ name: name.trim(), email: normalizedEmail, passwordHash, role: "user", avatar: "" })
    .returning();

  const accessToken  = AuthService.createAccessToken(user.id);
  const refreshToken = await AuthService.createRefreshToken(user.id);

  const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };
  res.cookie('session_token', refreshToken, cookieOptions);
  res.status(201).json({
    success: true,
    token: accessToken,
    accessToken,
    refreshToken,
    user: safeUser(user),
  });
});

// ── POST /api/v1/auth/login ─────────────────────────────────────────────────
router.post("/login", validateBody(loginBodySchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  if (!user || !(await AuthService.verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ success: false, message: "Invalid email or password." });
    return;
  }

  const accessToken  = AuthService.createAccessToken(user.id);
  const refreshToken = await AuthService.createRefreshToken(user.id);

  const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 };
  res.cookie('session_token', refreshToken, cookieOptions);
  res.json({
    success: true,
    token: accessToken,
    accessToken,
    refreshToken,
    user: safeUser(user),
  });
});

// ── POST /api/v1/auth/refresh ───────────────────────────────────────────────
router.post("/refresh", validateBody(refreshBodySchema), async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const userId = await AuthService.verifyRefreshToken(refreshToken);
  if (!userId) {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
    return;
  }

  const accessToken = AuthService.createAccessToken(userId);
  res.json({ success: true, accessToken, token: accessToken });
});

// ── POST /api/v1/auth/logout ────────────────────────────────────────────────
router.post("/logout", validateBody(logoutBodySchema), async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await AuthService.revokeRefreshToken(refreshToken);
  }
  res.json({ success: true, message: "Logged out." });
});

// ── GET /api/v1/auth/profile ────────────────────────────────────────────────
router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: safeUser(req.user!) });
});

export default router;
