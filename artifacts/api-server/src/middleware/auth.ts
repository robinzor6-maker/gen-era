import { type Request, type Response, type NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { logger } from "../lib/logger.js";

// SECURITY NOTE: Extend Express.Request type to attach verified JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "customer";
  iat: number;
  exp: number;
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.slice(7);
    const decoded = verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      res.status(401).json({ success: false, message: "Token expired" });
    } else {
      res.status(401).json({ success: false, message: "Invalid token" });
    }
  }
};

export const requireRole = (...allowedRoles: Array<"admin" | "customer">) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({ userId: req.user.userId, role: req.user.role }, "Forbidden: insufficient permissions");
      res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};

