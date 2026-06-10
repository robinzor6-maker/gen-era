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
    colors: [
      { name: "VOID BLACK", hex: "#000005" },
    ],
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
    tags: ["pendant", "eye", "glow", "silver", "featured"],
    colors: [
      { name: "OXIDIZED SILVER", hex: "#2a2a2a" },
      { name: "VOID GOLD", hex: "#d4a853" },
    ],
    sizes: ["ONE SIZE"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "Sterling Silver .925 / Photoluminescent Resin / Rolo Chain",
    weight: "28g",
    shippingInfo: "Ships within 2–3 business days in luxury box packaging.",
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
    subtitle: "Military-Grade Temple Uniform",
    collection: "void-season-i",
    shortDescription: "Ultra-black cargo pants with gold-embossed strap buckles and utility pockets.",
    description: "Military-grade obsidian fabric with moisture-wicking inner lining. Six utility pockets, reinforced knees, adjustable ankle straps with gold-embossed metal buckles. The uniform of the Temple.",
    longDescription: "The OBSIDIAN CARGO PANTS represent the intersection of tactical utility and pharaonic aesthetics. Constructed from a 4-way stretch ripstop fabric with a DWR (Durable Water Repellent) coating in a deep obsidian colorway. Six utility pockets include two thigh cargo bays with snap closures, two hip pockets, and two rear pockets — all featuring gold-embossed metal hardware. Reinforced knee panels accept optional knee pad inserts (sold separately). Adjustable ankle cuffs with industrial gold buckle closures. Interior moisture-wicking mesh liner ensures comfort in all climates.",
    price: 1800,
    comparePrice: 2200,
    category: "clothing",
    tags: ["cargo", "pants", "black", "military"],
    colors: [
      { name: "OBSIDIAN", hex: "#070710" },
      { name: "SAND STORM", hex: "#8b7355" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "4-Way Stretch Ripstop / DWR Coating / Moisture-Wicking Mesh Lining",
    weight: "520g",
    shippingInfo: "Ships within 3–5 business days. Free shipping on orders over ج.م 2000.",
    stock: 8,
    featured: false,
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
    description: "Six-panel structured cap in sand-washed canvas. Front panel features raised embroidery of the Eye of Ra. Adjustable tactical buckle closure. UV-resistant coating for desert conditions.",
    longDescription: "The DESERT STORM CAP merges military precision with ancient symbolism. Six-panel construction in heavyweight sand-washed canvas with a UV-resistant treatment that prevents fading in extreme sunlight. The front panel features a 3D puff embroidery of the Eye of Ra in tonal sand thread, rising 4mm off the fabric surface for tactile depth. Structured brim with anti-glare underside coating. Adjustable gold-tone tactical buckle rear strap accommodates head sizes from 54–60cm. Taffeta sweatband with moisture-wicking treatment. Glyph-stamped leather inner label.",
    price: 650,
    comparePrice: undefined,
    category: "accessories",
    tags: ["cap", "hat", "ra", "sand", "featured"],
    colors: [
      { name: "SAND WASH", hex: "#c4a882" },
      { name: "VOID BLACK", hex: "#000005" },
      { name: "DESERT KHAKI", hex: "#b8a87a" },
    ],
    sizes: ["ONE SIZE"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "Heavyweight Canvas / 3D Puff Embroidery / Taffeta Sweatband",
    weight: "145g",
    shippingInfo: "Ships within 2–3 business days.",
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
    subtitle: "Burnt-Orange Hieroglyphic Bomber",
    collection: "nile-fire",
    shortDescription: "Burnt-orange oversized bomber with hieroglyphic lining and reflective trim.",
    description: "A statement piece inspired by the flames of the Nile. Burnt-orange shell with full-coverage hieroglyphic lining. Reflective trim activates under light. Dropped shoulders, boxy fit.",
    longDescription: "The NILE FIRE JACKET is the flagship statement piece of the Nile Fire capsule collection. The exterior shell is a custom-dyed burnt-orange satin-weave polyester, treated with 3M Scotchlite reflective trim along the shoulders, collar, and cuffs — creating an ethereal glow under flash photography and vehicle lights. The interior features a full-coverage woven hieroglyphic lining in contrast black and gold, visible when the jacket is open or worn off-shoulder. Dropped-shoulder, boxy silhouette with a single concealed chest zip pocket. Gold YKK zippers throughout. This is a limited-run piece — only 50 units per colorway.",
    price: 3200,
    comparePrice: 4000,
    category: "clothing",
    tags: ["jacket", "bomber", "fire", "orange"],
    colors: [
      { name: "NILE FIRE", hex: "#c84800" },
      { name: "VOID BLACK", hex: "#000005" },
    ],
    sizes: ["S", "M", "L", "XL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "Satin Polyester Shell / 3M Scotchlite Reflective Trim / Woven Hieroglyphic Lining",
    weight: "740g",
    shippingInfo: "Ships within 5–7 business days. Limited edition — final sale.",
    stock: 5,
    featured: false,
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
    subtitle: "Heavy-Link Gold · Symbol of Eternity",
    collection: "ankh-protocol",
    shortDescription: "Heavy-link gold-plated chain bracelet with solid ankh charm.",
    description: "18k gold-plated stainless steel chain with adjustable lobster clasp. Features a solid ankh charm — symbol of life and eternity. Tarnish-resistant and hypoallergenic.",
    longDescription: "The ANKH CHAIN BRACELET is a foundational piece in the Ankh Protocol collection. Heavy-link chain construction in 18k gold-plated 316L surgical stainless steel — hypoallergenic, nickel-free, and resistant to tarnishing even with daily wear. The centerpiece solid ankh charm measures 18mm × 12mm and is cast from solid brass before gold plating, giving it substantial weight and presence. Adjustable length from 17cm to 21cm via lobster clasp closure. Worn stacked with the Void Eye Pendant for the full Temple look.",
    price: 480,
    comparePrice: undefined,
    category: "accessories",
    tags: ["bracelet", "ankh", "gold", "chain"],
    colors: [
      { name: "VOID GOLD", hex: "#d4a853" },
      { name: "OXIDIZED SILVER", hex: "#2a2a2a" },
    ],
    sizes: ["ONE SIZE"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "18k Gold-Plated Stainless Steel / Solid Brass Ankh Charm",
    weight: "42g",
    shippingInfo: "Ships within 2–3 business days in luxury box packaging.",
    stock: 0,
    featured: false,
    active: true,
    rating: 4.5,
    reviewCount: 89,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "prod_007",
    slug: "scarab-tech-tee",
    name: "SCARAB TECH TEE",
    subtitle: "Phosphorescent Print · Heavyweight Cotton",
    collection: "void-season-i",
    shortDescription: "Heavyweight black tee with phosphorescent scarab beetle chest print.",
    description: "Heavyweight 220gsm cotton tee with a full-chest phosphorescent scarab print that glows green in darkness. Drop-shoulder cut, ribbed collar, raw hem.",
    longDescription: "The SCARAB TECH TEE brings ancient Egyptian symbolism into the age of bioluminescence. The scarab beetle — deity of transformation — is rendered in a 40cm × 35cm screen print using a proprietary phosphorescent ink formula. After 60 seconds of light exposure, the print glows with a vibrant green luminescence for up to 2 hours. Constructed from 220gsm ring-spun cotton in a drop-shoulder, boxy cut. Ribbed crew collar with reinforced double-needle stitching. Raw hem finish for an industrial edge. Pre-washed for softness.",
    price: 1200,
    comparePrice: undefined,
    category: "clothing",
    tags: ["tee", "scarab", "glow", "print"],
    colors: [
      { name: "VOID BLACK", hex: "#000005" },
      { name: "TEMPLE GREY", hex: "#1a1a2e" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    image: "",
    gallery: [],
    modelPath: "",
    texturePath: "",
    material: "220gsm Ring-Spun Cotton / Phosphorescent Screen Print",
    weight: "280g",
    shippingInfo: "Ships within 3–5 business days. Free shipping on orders over ج.م 2000.",
    stock: 22,
    featured: true,
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
    colors: [
      { name: "BRUSHED TITANIUM", hex: "#6b7280" },
    ],
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
  const page  = Math.max(1, parseInt(String(req.query.page  || "1")));
  const limit = Math.min(50, parseInt(String(req.query.limit || "9")));
  const category   = req.query.category as string | undefined;
  const collection = req.query.collection as string | undefined;
  const q = req.query.q as string | undefined;

  let filtered = products.filter((p) => p.active);
  if (category)   filtered = filtered.filter((p) => p.category === category);
  if (collection) filtered = filtered.filter((p) => p.collection === collection);
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
