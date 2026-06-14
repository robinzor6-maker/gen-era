import { Router, type Request, type Response } from "express";
import { desc, sql, count, eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { artifactViewsTable, artifactChamberVisitsTable, artifactClaimsTable } from "../lib/db.js";
import { z } from "zod/v4";
import { verifyToken, requireRole } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = Router();

// SECURITY NOTE: 100 req/15min per IP prevents analytics dashboard abuse
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many dashboard requests — please try again later." },
});

// ── Schemas ───────────────────────────────────────────────────────────────────

const viewSchema = z.object({
  artifactId:   z.string().min(1),
  artifactName: z.string().min(1),
  collection:   z.string().default(""),
  district:     z.string().default("gencore"),
  sessionId:    z.string().default(""),
});

const chamberSchema = viewSchema;

const claimSchema = viewSchema.extend({
  priceCents: z.number().int().min(0).default(0),
  converted:  z.boolean().default(false),
});

// ── POST /api/v1/analytics/view ───────────────────────────────────────────────
// Public write — fire-and-forget tracking (no auth required)

router.post("/view", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = viewSchema.parse(req.body);
    await db.insert(artifactViewsTable).values(data);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid payload" });
  }
});

// ── POST /api/v1/analytics/chamber ───────────────────────────────────────────
// Public write — fire-and-forget tracking (no auth required)

router.post("/chamber", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = chamberSchema.parse(req.body);
    await db.insert(artifactChamberVisitsTable).values(data);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid payload" });
  }
});

// ── POST /api/v1/analytics/claim ─────────────────────────────────────────────
// Public write — fire-and-forget tracking (no auth required)

router.post("/claim", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = claimSchema.parse(req.body);
    await db.insert(artifactClaimsTable).values(data);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid payload" });
  }
});

// ── GET /api/v1/analytics/dashboard ──────────────────────────────────────────
// Protected read — admin-only with rate limiting

router.get(
  "/dashboard",
  dashboardLimiter,
  verifyToken,
  requireRole("admin"),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const [totalViews] = await db.select({ c: count() }).from(artifactViewsTable);
      const [totalChambers] = await db.select({ c: count() }).from(artifactChamberVisitsTable);
      const [totalClaims] = await db.select({ c: count() }).from(artifactClaimsTable);

      const topViewed = await db
        .select({
          artifactId:   artifactViewsTable.artifactId,
          artifactName: artifactViewsTable.artifactName,
          views:        count(),
        })
        .from(artifactViewsTable)
        .groupBy(artifactViewsTable.artifactId, artifactViewsTable.artifactName)
        .orderBy(desc(count()))
        .limit(5);

      const topClaimed = await db
        .select({
          artifactId:   artifactClaimsTable.artifactId,
          artifactName: artifactClaimsTable.artifactName,
          claims:       count(),
        })
        .from(artifactClaimsTable)
        .groupBy(artifactClaimsTable.artifactId, artifactClaimsTable.artifactName)
        .orderBy(desc(count()))
        .limit(5);

      const districtViews = await db
        .select({
          district: artifactViewsTable.district,
          views:    count(),
        })
        .from(artifactViewsTable)
        .groupBy(artifactViewsTable.district)
        .orderBy(desc(count()));

      res.json({
        success: true,
        data: {
          totals: {
            views:          totalViews.c,
            chamberVisits:  totalChambers.c,
            claims:         totalClaims.c,
          },
          topViewed,
          topClaimed,
          districtViews,
        },
      });
    } catch (err) {
      console.error("Analytics dashboard error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;

