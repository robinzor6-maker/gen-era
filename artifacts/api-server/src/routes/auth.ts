import { Router, Request, Response } from "express";
import crypto from "crypto";

const router = Router();

// ─── Simple in-memory user store ─────────────────────────────────────────
interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  avatar: string;
  createdAt: string;
}

const users: User[] = [];
const tokens: Map<string, string> = new Map(); // token -> userId

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "gen-era-salt").digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getUserFromToken(req: Request): User | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const userId = tokens.get(token);
  if (!userId) return null;
  return users.find((u) => u._id === userId) || null;
}

// POST /api/v1/auth/register
router.post("/register", (req: Request, res: Response) => {
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
  if (users.find((u) => u.email === normalizedEmail)) {
    res.status(409).json({ success: false, message: "Email already registered." });
    return;
  }

  const user: User = {
    _id: `user_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: "user",
    avatar: "",
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  const token = generateToken();
  tokens.set(token, user._id);

  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ success: true, token, user: safeUser });
});

// POST /api/v1/auth/login
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    res.status(400).json({ success: false, message: "Email and password are required." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ success: false, message: "Invalid email or password." });
    return;
  }

  const token = generateToken();
  tokens.set(token, user._id);

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// GET /api/v1/auth/profile
router.get("/profile", (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

export { getUserFromToken };
export default router;
