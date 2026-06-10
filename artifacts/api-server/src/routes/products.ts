import { Router } from "express";

const router = Router();

// ─── Shared product catalog (exported for orders.ts) ─────────────────────
export const products = [
  {
    _id: "prod_001",
    slug: "pharaoh-cyber-hoodie",
    name: "PHARAOH CYBER HOODIE",
    subtitle: "Hieroglyphic Oversized Silhouette",
    collection: "void-season-i",
    shortDescription: "Black oversized hoodie with gold hieroglyphic embroidery and neon-laced hood.",
    description: "Channel the spirit of the Pharaohs with our signature cyberpunk hoodie. Hand-embroidered hieroglyphic patterns meet LED-reactive fabric. Oversized unisex cut, premium heavyweight cotton blend.",
    longDescription: "The PHARAOH CYBER HOODIE is the crown jewel of the Void Season I collection. Each piece is hand-finished with 24 individual hieroglyphic embroidery points using gold-tone UV-reactive thread. The hood features custom-woven neon trim that activates under ultraviolet light, creating an immersive glow that references the bioluminescent aura of ancient temple rituals. The body is cut in a dropped-shoulder, oversized silhouette from 400gsm heavyweight French terry cotton, ensuring warmth and structure. Two kangaroo pockets feature concealed gold zip closures. Available in Void Black only.",
    price: 2800,
    comparePrice: 3500,
    category: "clothing",
    tags: ["hoodie", "pharaoh", "cyber", "featured"],
    colors: [{ name: "VOID BLACK", hex: "#000005" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "400gsm French Terry Cotton / UV-Reactive Thread Embroidery",
    weight: "680g",
    shippingInfo: "Ships within 3–5 business days. Free shipping on orders over ج.م 2000.",
    stock: 15,
    featured: true,
    active: true,
    rating: 4.9,
    reviewCount: 84,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_002",
    slug: "void-eye-pendant",
    name: "VOID EYE PENDANT",
    subtitle: "Oxidized Silver · Photoluminescent Core",
    collection: "ankh-protocol",
    shortDescription: "Oxidized silver Eye of Horus pendant with glowing cyan resin core.",
    description: "Forged from sterling silver with an oxidized black finish. The Eye of Horus centerpiece holds a photoluminescent resin core that absorbs light and glows cyan in the dark. Chain included (60cm).",
    longDescription: "Handcrafted by artisans in Cairo, the VOID EYE PENDANT is a talisman for the digital age. Sterling .925 silver base is treated with a proprietary oxidation process to achieve the signature void-black finish. The central Wadjet eye chamber is filled with a photoluminescent resin — charged by 30 seconds of ambient light, it glows a vibrant cyan for up to 4 hours. The 60cm rolo chain features a secure lobster clasp and matching oxidized finish. Each pendant is individually numbered on the reverse face.",
    price: 950,
    comparePrice: undefined,
    category: "accessories",
    tags: ["pendant", "eye-of-horus", "silver", "featured"],
    colors: [{ name: "OXIDIZED SILVER", hex: "#1a1a2e" }],
    sizes: ["ONE SIZE"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "Sterling Silver .925 / Oxidized Finish / Photoluminescent Resin",
    weight: "28g (with chain)",
    shippingInfo: "Ships in protective box. Free shipping on orders over ج.م 2000.",
    stock: 42,
    featured: true,
    active: true,
    rating: 4.8,
    reviewCount: 127,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_003",
    slug: "obsidian-cargo-pants",
    name: "OBSIDIAN CARGO PANTS",
    subtitle: "Tactical Cut · Hieroglyph Embossed Hardware",
    collection: "void-season-i",
    shortDescription: "Tactical cargo pants in obsidian black with embossed hieroglyphic hardware.",
    description: "Technical cargo trousers cut in a tapered silhouette. Eight cargo pockets feature embossed hieroglyphic hardware. Heavy-duty YKK zippers, articulated knees, and adjustable hem.",
    longDescription: "The OBSIDIAN CARGO PANTS are engineered for the urban archaeologist. Cut from a 300gsm cotton-ripstop blend, they combine the durability of technical outerwear with the refined silhouette of luxury fashion. Eight pockets — four standard, two side cargo, two rear — all secured with embossed hieroglyphic pull tabs cast from zinc alloy. Adjustable waistband with a custom GEN ERA branded buckle. Tapered cut with articulated knee paneling for unrestricted movement. Ankle cuffs feature hidden tie adjusters for customizable silhouette. Available in Obsidian Black only.",
    price: 1800,
    comparePrice: 2200,
    category: "clothing",
    tags: ["cargo", "pants", "tactical", "featured"],
    colors: [{ name: "OBSIDIAN BLACK", hex: "#0a0a0f" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "300gsm Cotton-Ripstop Blend / Zinc Alloy Hardware",
    weight: "520g",
    shippingInfo: "Ships within 3–5 business days. Free shipping on orders over ج.م 2000.",
    stock: 8,
    featured: true,
    active: true,
    rating: 4.7,
    reviewCount: 56,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_004",
    slug: "desert-storm-cap",
    name: "DESERT STORM CAP",
    subtitle: "Eye of Ra · UV-Resistant Canvas",
    collection: "ankh-protocol",
    shortDescription: "Sand-washed cap with embroidered Eye of Ra and tactical buckle strap.",
    description: "Six-panel structured cap in UV-resistant canvas. Front panel features a hand-stitched Eye of Ra embroidery in gold thread. Tactical rear buckle strap with custom GEN ERA engraving.",
    longDescription: "The DESERT STORM CAP is constructed from a UV-resistant cotton canvas that maintains color integrity under prolonged sun exposure — essential for the desert oracle. The front panel carries a 12-point hand-stitched Eye of Ra embroidery using gold Madeira thread, measuring 6cm at its widest point. The structured crown maintains shape while allowing breathability through micro-perforated side panels. The rear features a military-grade tactile closure strap with a custom engraved GEN ERA buckle in antique brass. One size fits most with adjustment range 56–60cm.",
    price: 650,
    comparePrice: undefined,
    category: "accessories",
    tags: ["cap", "hat", "eye-of-ra", "featured"],
    colors: [
      { name: "DESERT SAND", hex: "#c4a882" },
      { name: "VOID BLACK", hex: "#000005" },
    ],
    sizes: ["ONE SIZE"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "UV-Resistant Cotton Canvas / Gold Madeira Thread / Antique Brass",
    weight: "140g",
    shippingInfo: "Ships in dust bag within 2–4 business days.",
    stock: 30,
    featured: true,
    active: true,
    rating: 4.6,
    reviewCount: 203,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_005",
    slug: "nile-fire-jacket",
    name: "NILE FIRE JACKET",
    subtitle: "Heat-Reactive Liner · Scorched Horizon",
    collection: "nile-fire",
    shortDescription: "Technical jacket with heat-reactive liner panels in scorched-horizon colorway.",
    description: "Technical jacket featuring heat-reactive liner panels that shift from amber to crimson under body warmth. Outer shell in premium waxed cotton. Interior gold satin lining with hieroglyphic print.",
    longDescription: "The NILE FIRE JACKET is the statement piece of the Nile Fire collection. The outer shell is constructed from 450gsm waxed cotton canvas in a scorched-horizon brown that develops a natural patina with wear — the jacket becomes uniquely yours over time. The revolutionary interior features thermochromic liner panels treated with a heat-reactive pigment that transitions from deep amber to vivid crimson as it warms to body temperature. The interior gold satin is screen-printed with an all-over hieroglyphic manuscript pattern sourced from the Book of the Dead. Oversized silhouette, dropped shoulders, storm collar. Hidden inside pocket with gold zipper.",
    price: 3200,
    comparePrice: 4000,
    category: "clothing",
    tags: ["jacket", "heat-reactive", "nile", "featured"],
    colors: [
      { name: "SCORCHED AMBER", hex: "#b45309" },
      { name: "VOID BLACK", hex: "#000005" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "450gsm Waxed Cotton Canvas / Thermochromic Liner / Gold Satin Interior",
    weight: "1.2kg",
    shippingInfo: "Ships in signature GEN ERA box within 5–7 business days.",
    stock: 5,
    featured: true,
    active: true,
    rating: 5.0,
    reviewCount: 31,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_006",
    slug: "ankh-chain-bracelet",
    name: "ANKH CHAIN BRACELET",
    subtitle: "Interlocking Ankh Links · Sterling Silver",
    collection: "ankh-protocol",
    shortDescription: "Interlocking ankh link bracelet in oxidized sterling silver.",
    description: "Heavy-gauge sterling silver bracelet composed of interlocking Ankh symbol links. Oxidized black finish. Box clasp with GEN ERA engraving. Sold out — restocking.",
    longDescription: "The ANKH CHAIN BRACELET is the anchor piece of the Ankh Protocol accessories system. Each link is individually cast from sterling silver .925 using lost-wax casting — a technique unchanged since ancient Egypt — then oxidized to the signature void-black finish. The Ankh links are 18mm tall and 12mm wide, giving the bracelet a substantial presence without excess weight. The box clasp features a hidden push-button release and is engraved with the GEN ERA sigil on its exterior face. Length: 20cm standard (custom sizing available on request). Wear alone or stack with the Ankh pendant for the full protocol.",
    price: 480,
    comparePrice: undefined,
    category: "accessories",
    tags: ["bracelet", "ankh", "silver", "chain"],
    colors: [{ name: "OXIDIZED SILVER", hex: "#1a1a2e" }],
    sizes: ["ONE SIZE"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "Sterling Silver .925 / Oxidized Finish / Box Clasp",
    weight: "42g",
    shippingInfo: "Ships in protective box within 2–3 business days.",
    stock: 0,
    featured: false,
    active: true,
    rating: 4.8,
    reviewCount: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_007",
    slug: "scarab-tech-tee",
    name: "SCARAB TECH TEE",
    subtitle: "Photosensitive Print · Sacred Geometry Grid",
    collection: "void-season-i",
    shortDescription: "Premium tee with photosensitive scarab print that activates in sunlight.",
    description: "Premium 200gsm ringspun cotton tee featuring a photosensitive scarab beetle print over a sacred geometry grid. The print darkens under UV light exposure.",
    longDescription: "The SCARAB TECH TEE bridges ancient symbolism with modern material science. Constructed from 200gsm ringspun cotton in a classic relaxed fit, the front panel carries a large-format photosensitive scarab beetle print positioned over a hand-calculated sacred geometry grid (Flower of Life base, phi-ratio proportioned). The photosensitive ink responds to UV light exposure — in direct sunlight, the scarab deepens from silver-grey to near-black over approximately 30 seconds, then fades back indoors. Each print is screen-applied in 4 passes using archival inks rated for 50+ wash cycles without fade. The geometry grid is printed in a low-visibility iridescent silver visible only at certain angles.",
    price: 850,
    comparePrice: 1100,
    category: "clothing",
    tags: ["tee", "scarab", "photosensitive", "sacred-geometry"],
    colors: [
      { name: "VOID BLACK", hex: "#000005" },
      { name: "COSMIC GREY", hex: "#1f2937" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "200gsm Ringspun Cotton / Photosensitive Screen Print / Iridescent Silver Grid",
    weight: "280g",
    shippingInfo: "Ships within 3–5 business days. Free shipping on orders over ج.م 2000.",
    stock: 22,
    featured: false,
    active: true,
    rating: 4.7,
    reviewCount: 148,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_008",
    slug: "horus-ring-titanium",
    name: "HORUS RING TITANIUM",
    subtitle: "Aircraft-Grade Titanium · Engraved Falcon",
    collection: "ankh-protocol",
    shortDescription: "Aircraft-grade titanium band ring with engraved Horus falcon sigil.",
    description: "Grade 5 titanium band with laser-engraved Horus falcon sigil on the outer face. Lightweight, hypoallergenic, and virtually indestructible. Brushed finish.",
    longDescription: "The HORUS RING TITANIUM is engineered for permanence. Machined from Grade 5 (Ti-6Al-4V) aircraft titanium — the same alloy used in aerospace components — the ring is virtually indestructible, hypoallergenic, and weighs a fraction of traditional metals. The outer band features a full-wrap laser-engraved Horus falcon hieroglyph sequence, etched to a depth of 0.3mm for precise definition. Brushed matte finish with polished inner bore for comfort. Available in sizes 6 through 12 (US sizing). Comes with a felt pouch embossed with the GEN ERA sigil.",
    price: 720,
    comparePrice: undefined,
    category: "accessories",
    tags: ["ring", "horus", "titanium", "jewelry"],
    colors: [{ name: "BRUSHED TITANIUM", hex: "#6b7280" }],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "Grade 5 Titanium (Ti-6Al-4V) / Laser Engraving",
    weight: "18g",
    shippingInfo: "Ships within 2–3 business days in felt pouch.",
    stock: 18,
    featured: false,
    active: true,
    rating: 4.9,
    reviewCount: 67,
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
  const page       = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit      = Math.min(50, parseInt(String(req.query.limit || "9")));
  const category   = req.query.category   as string | undefined;
  const collection = req.query.collection as string | undefined;
  const q          = req.query.q          as string | undefined;
  const minPrice   = req.query.minPrice   ? parseInt(String(req.query.minPrice))   : undefined;
  const maxPrice   = req.query.maxPrice   ? parseInt(String(req.query.maxPrice))   : undefined;
  const inStock    = req.query.inStock === "true" ? true : undefined;

  let filtered = products.filter((p) => p.active);
  if (category)   filtered = filtered.filter((p) => p.category === category);
  if (collection) filtered = filtered.filter((p) => p.collection === collection);
  if (inStock)    filtered = filtered.filter((p) => p.stock > 0);
  if (minPrice !== undefined) filtered = filtered.filter((p) => p.price >= minPrice);
  if (maxPrice !== undefined) filtered = filtered.filter((p) => p.price <= maxPrice);
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) ||
        p.subtitle.toLowerCase().includes(lq) ||
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
  const q     = String(req.query.q || "").toLowerCase();
  const page  = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit || "9")));
  const filtered = products.filter(
    (p) =>
      p.active &&
      (p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)))
  );
  res.json({ success: true, ...paginate(filtered, page, limit) });
});

// GET /api/v1/products/category/:category
router.get("/category/:category", (req, res) => {
  const { category } = req.params;
  const page  = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit || "9")));
  const filtered = products.filter((p) => p.active && p.category === category);
  res.json({ success: true, ...paginate(filtered, page, limit) });
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
