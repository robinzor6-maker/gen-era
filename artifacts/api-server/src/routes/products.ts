import { Router } from "express";

const router = Router();

// ─── In-memory product store (seed data) ─────────────────────────────────
const products = [
  {
    _id: "prod_001",
    slug: "pharaoh-cyber-hoodie",
    name: "PHARAOH CYBER HOODIE",
    shortDescription: "Black oversized hoodie with gold hieroglyphic embroidery and neon-laced hood.",
    description: "Channel the spirit of the Pharaohs with our signature cyberpunk hoodie. Hand-embroidered hieroglyphic patterns meet LED-reactive fabric. Oversized unisex cut, premium heavyweight cotton blend.",
    price: 2800,
    category: "clothing",
    tags: ["hoodie", "pharaoh", "cyber", "featured"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    stock: 15,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_002",
    slug: "void-eye-pendant",
    name: "VOID EYE PENDANT",
    shortDescription: "Oxidized silver Eye of Horus pendant with glowing cyan resin core.",
    description: "Forged from sterling silver with an oxidized black finish. The Eye of Horus centerpiece holds a photoluminescent resin core that absorbs light and glows cyan in the dark. Chain included (60cm).",
    price: 950,
    category: "accessories",
    tags: ["pendant", "eye", "glow", "silver", "featured"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    stock: 42,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_003",
    slug: "obsidian-cargo-pants",
    name: "OBSIDIAN CARGO PANTS",
    shortDescription: "Ultra-black cargo pants with gold-embossed strap buckles and utility pockets.",
    description: "Military-grade obsidian fabric with moisture-wicking inner lining. Six utility pockets, reinforced knees, adjustable ankle straps with gold-embossed metal buckles. The uniform of the Temple.",
    price: 1800,
    category: "clothing",
    tags: ["cargo", "pants", "black", "military"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    stock: 8,
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_004",
    slug: "desert-storm-cap",
    name: "DESERT STORM CAP",
    shortDescription: "Sand-washed cap with embroidered Eye of Ra and tactical buckle strap.",
    description: "Six-panel structured cap in sand-washed canvas. Front panel features raised embroidery of the Eye of Ra. Adjustable tactical buckle closure. UV-resistant coating for desert conditions.",
    price: 650,
    category: "accessories",
    tags: ["cap", "hat", "ra", "sand", "featured"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    stock: 30,
    featured: true,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_005",
    slug: "nile-fire-jacket",
    name: "NILE FIRE JACKET",
    shortDescription: "Burnt-orange oversized bomber with hieroglyphic lining and reflective trim.",
    description: "A statement piece inspired by the flames of the Nile. Burnt-orange shell with full-coverage hieroglyphic lining. Reflective trim activates under light. Dropped shoulders, boxy fit.",
    price: 3200,
    category: "clothing",
    tags: ["jacket", "bomber", "fire", "orange"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    stock: 5,
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_006",
    slug: "ankh-chain-bracelet",
    name: "ANKH CHAIN BRACELET",
    shortDescription: "Heavy-link gold-plated chain bracelet with solid ankh charm.",
    description: "18k gold-plated stainless steel chain with adjustable lobster clasp. Features a solid ankh charm — symbol of life and eternity. Tarnish-resistant and hypoallergenic.",
    price: 480,
    category: "accessories",
    tags: ["bracelet", "ankh", "gold", "chain"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    stock: 0,
    featured: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function paginate<T>(arr: T[], page: number, limit: number) {
  const total = arr.length;
  const pages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const data = arr.slice(start, start + limit);
  return { data, pagination: { page, limit, total, pages } };
}

// GET /api/v1/products
router.get("/", (req, res) => {
  const page  = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit || "9")));
  const category = req.query.category as string | undefined;
  const q = req.query.q as string | undefined;

  let filtered = products.filter((p) => p.active);
  if (category) filtered = filtered.filter((p) => p.category === category);
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) ||
        p.description.toLowerCase().includes(lq) ||
        p.tags.some((t) => t.toLowerCase().includes(lq))
    );
  }

  const result = paginate(filtered, page, limit);
  res.json({ success: true, ...result });
});

// GET /api/v1/products/featured
router.get("/featured", (_req, res) => {
  const featured = products.filter((p) => p.active && p.featured);
  res.json({ success: true, data: featured, pagination: { page: 1, limit: 10, total: featured.length, pages: 1 } });
});

// GET /api/v1/products/search
router.get("/search", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const page  = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit || "9")));

  const filtered = products.filter(
    (p) =>
      p.active &&
      (p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)))
  );
  const result = paginate(filtered, page, limit);
  res.json({ success: true, ...result });
});

// GET /api/v1/products/category/:category
router.get("/category/:category", (req, res) => {
  const { category } = req.params;
  const page  = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit || "9")));
  const filtered = products.filter((p) => p.active && p.category === category);
  const result = paginate(filtered, page, limit);
  res.json({ success: true, ...result });
});

// GET /api/v1/products/:slug
router.get("/:slug", (req, res) => {
  const product = products.find((p) => p.slug === req.params.slug && p.active);
  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }
  res.json({ success: true, data: product });
});

export default router;
