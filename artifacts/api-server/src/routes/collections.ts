import { Router } from "express";
import { products } from "./products";

const router = Router();

const collections = [
  {
    id: "coll_001",
    slug: "void-season-i",
    name: "VOID SEASON I",
    description: "The inaugural collection. Born from darkness, built for the Temple. Core streetwear silhouettes infused with ancient power.",
    season: "Autumn/Winter",
    year: 2025,
    coverGlyph: "𓂀",
    theme: "The void between stars — where pharaohs become constellations.",
  },
  {
    id: "coll_002",
    slug: "ankh-protocol",
    name: "ANKH PROTOCOL",
    description: "Accessories and jewellery channeling the eternal symbol of life into wearable artifacts for the digital age.",
    season: "Year-Round",
    year: 2025,
    coverGlyph: "𓋹",
    theme: "The loop of life encoded in metal and light.",
  },
  {
    id: "coll_003",
    slug: "nile-fire",
    name: "NILE FIRE",
    description: "Statement outerwear. The heat of the desert sun captured in burnt-orange and reflective materials.",
    season: "Limited Edition",
    year: 2025,
    coverGlyph: "𓆑",
    theme: "When the Nile catches fire at dusk.",
  },
];

// GET /api/v1/collections
router.get("/", (_req, res) => {
  const enriched = collections.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.active && p.collection === c.slug).length,
  }));
  res.json({ success: true, data: enriched });
});

// GET /api/v1/collections/:slug
router.get("/:slug", (req, res) => {
  const collection = collections.find((c) => c.slug === req.params.slug);
  if (!collection) {
    res.status(404).json({ success: false, message: "Collection not found" });
    return;
  }
  const collectionProducts = products.filter(
    (p) => p.active && p.collection === req.params.slug
  );
  res.json({
    success: true,
    data: {
      ...collection,
      productCount: collectionProducts.length,
      products: collectionProducts,
    },
  });
});

export default router;
