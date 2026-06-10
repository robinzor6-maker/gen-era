/**
 * GEN ERA — Database Seed Script
 * Seeds the products collection with demo products matching the new schema.
 *
 * Usage: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const ENV_VARS = require('../config/env');

const seedProducts = [
  {
    slug: 'desert-cyber-jacket',
    name: 'Desert Cyber Jacket',
    shortDescription: 'Pharaonic-cut jacket with embedded circuit patterns. Limited edition.',
    description: `A statement piece that merges Ancient Egyptian silhouettes with cyberpunk utility.
Heavy-duty outer shell, ventilated lining, holographic embroidery along collar.
Designed for those who walk between worlds.`,
    price: 3800,
    category: 'clothing',
    tags: ['jacket', 'outerwear', 'cyberpunk', 'limited'],
    image: '/images/products/jacket/main.jpg',
    gallery: [
      '/images/products/jacket/gallery-1.jpg',
      '/images/products/jacket/gallery-2.jpg',
    ],
    modelPath: '/models/jacket.glb',
    texturePath: '',
    stock: 15,
    featured: true,
    active: true,
  },
  {
    slug: 'void-hoodie',
    name: 'Void Hoodie',
    shortDescription: 'Ultra-black fleece with Eye of Ra print. Void absorbs light.',
    description: `Crafted from premium cotton-blend with a ultra-deep black finish that seems to absorb light.
The oversized Eye of Ra print glows subtly under UV. Drop-fit silhouette.
One size: designed to drape, not restrict.`,
    price: 2200,
    category: 'clothing',
    tags: ['hoodie', 'streetwear', 'pharaonic'],
    image: '/images/products/hoodie/main.jpg',
    gallery: [
      '/images/products/hoodie/gallery-1.jpg',
    ],
    modelPath: '/models/hoodie.glb',
    texturePath: '',
    stock: 30,
    featured: true,
    active: true,
  },
  {
    slug: 'anubis-chain',
    name: 'Anubis Chain',
    shortDescription: 'Heavy-gauge sterling silver chain with Anubis pendant.',
    description: `925 sterling silver. Hand-cast Anubis pendant with onyx inlay eyes.
55cm chain, lobster clasp. Each piece individually numbered.
Comes in a black papyrus gift box.`,
    price: 1450,
    category: 'accessories',
    tags: ['chain', 'jewelry', 'silver', 'anubis'],
    image: '/images/products/chain/main.jpg',
    gallery: [],
    modelPath: '/models/chain.glb',
    texturePath: '',
    stock: 50,
    featured: true,
    active: true,
  },
  {
    slug: 'temple-runner-sneakers',
    name: 'Temple Runner Sneakers',
    shortDescription: 'Low-top sneakers inspired by temple floor tile geometry.',
    description: `White leather with gold geometric inlay patterns derived from Karnak floor tiles.
Air-cushioned sole. Gum bottom. Comes with two lace options: white and gold.
Run the temple. Own the myth.`,
    price: 4500,
    category: 'clothing',
    tags: ['sneakers', 'footwear', 'gold'],
    image: '/images/products/sneakers/main.jpg',
    gallery: [
      '/images/products/sneakers/gallery-1.jpg',
      '/images/products/sneakers/gallery-2.jpg',
    ],
    modelPath: '/models/sneakers.glb',
    texturePath: '',
    stock: 0,  // out of stock — to test disabled button
    featured: false,
    active: true,
  },
  {
    slug: 'eye-of-ra-signet',
    name: 'Eye of Ra Signet Ring',
    shortDescription: 'Bold gold-plated signet with engraved Eye of Ra.',
    description: `Gold-plated brass, adjustable band. Heavy, architectural signet silhouette.
Deep-engraved Eye of Ra hieroglyph. Unisex design. Adjusts to sizes 7–12.`,
    price: 650,
    category: 'accessories',
    tags: ['ring', 'jewelry', 'gold', 'eye of ra'],
    image: '/images/products/ring/main.jpg',
    gallery: [],
    modelPath: '',  // no 3D model yet — test fallback
    texturePath: '',
    stock: 100,
    featured: false,
    active: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log('🗄️  Connected to MongoDB');

    // Clear existing products
    const deleted = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing products`);

    // Insert new products
    const inserted = await Product.insertMany(seedProducts);
    console.log(`✅ Seeded ${inserted.length} products:`);
    inserted.forEach((p) => console.log(`   • [${p.slug}] ${p.name} — EGP ${p.price}`));

    console.log('\n🔥 Seed complete. Run the backend and check /api/v1/products');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
