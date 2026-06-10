import { Router, Request, Response } from "express";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable } from "../lib/db.js";

const router = Router();

// ─── In-memory token store (Step 2 will replace with JWT + DB sessions) ─────
const tokens: Map<string, string> = new Map(); // token -> userId

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "gen-era-salt").digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

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

export async function getUserFromToken(req: Request): Promise<DbUser | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const userId = tokens.get(token);
  if (!userId) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user ?? null;
}

// POST /api/v1/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ success: false, message: "Name, email and password are required." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    return;
  }

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

  const [user] = await db
    .insert(usersTable)
    .values({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: "user",
      avatar: "",
    })
    .returning();

  const token = generateToken();
  tokens.set(token, user.id);

  res.status(201).json({ success: true, token, user: safeUser(user) });
});

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    res.status(400).json({ success: false, message: "Email and password are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ success: false, message: "Invalid email or password." });
    return;
  }

  const token = generateToken();
  tokens.set(token, user.id);

  res.json({ success: true, token, user: safeUser(user) });
});

// GET /api/v1/auth/profile
router.get("/profile", async (req: Request, res: Response) => {
  const user = await getUserFromToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  res.json({ success: true, data: safeUser(user) });
});

export default router;
