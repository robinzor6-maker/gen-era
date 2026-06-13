import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { AuthService } from "../services/authService.js";
import { db, usersTable } from "../lib/db.js";

export interface AuthRequest extends Request {
  user?: typeof usersTable.$inferSelect;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const token = header.slice(7);
  const payload = AuthService.verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ success: false, message: "User not found." });
    return;
  }

  req.user = user;
  next();
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = (req as any).cookies?.session_token ?? (req.cookies && (req.cookies as any).session_token);
  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const userId = await AuthService.verifyRefreshToken(token);
  if (!userId) {
    res.status(401).json({ success: false, message: "Invalid or expired session." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ success: false, message: "User not found." });
    return;
  }

  req.user = user;
  next();
}

export function requireRole(role: "admin" | "user") {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    if (req.user.role !== role && req.user.role !== "admin") {
      res.status(403).json({ success: false, message: "Insufficient permissions." });
      return;
    }
    next();
  };
}
