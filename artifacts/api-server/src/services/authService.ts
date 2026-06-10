import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { eq, lt } from "drizzle-orm";
import { db, sessionsTable } from "../lib/db.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required.");

const ACCESS_TOKEN_TTL  = "15m";
const REFRESH_TOKEN_DAYS = 7;

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static createAccessToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_TTL });
  }

  static verifyAccessToken(token: string): { userId: string } | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET as string) as { userId: string };
      return payload;
    } catch {
      return null;
    }
  }

  static async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ userId, refreshToken: token, expiresAt });
    return token;
  }

  static async verifyRefreshToken(token: string): Promise<string | null> {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.refreshToken, token))
      .limit(1);
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
      return null;
    }
    return session.userId;
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.refreshToken, token));
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
  }

  static async pruneExpiredSessions(): Promise<void> {
    await db.delete(sessionsTable).where(lt(sessionsTable.expiresAt, new Date()));
  }
}
