import { Router, type IRouter } from "express";
import { pool } from "../lib/db.js";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus = "connected";
  try {
    await pool.query("SELECT 1");
  } catch {
    dbStatus = "disconnected";
  }

  res.json({
    status: "ok",
    database: dbStatus,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
