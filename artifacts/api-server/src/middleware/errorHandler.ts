import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? 500;
  logger.error(err, "Unhandled error");

  if (status < 500) {
    res.status(status).json({ success: false, message: err.message });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error." });
}
