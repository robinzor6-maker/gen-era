const { validationResult } = require('express-validator');
const Product = require('../models/Product');

/**
 * Generates a URL-safe slug from a product name.
 * e.g. "Desert Cyber Jacket" → "desert-cyber-jacket"
 */
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

/**
 * GEN ERA — Product Controller
 * All public routes filter by active: true.
 * Admin routes operate on all documents.
 */

// ─── GET /api/v1/products ───────────────────────────────────────────────────
// Paginated, filterable by category / featured / sort / order / q (search)
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      featured,
      sort = 'createdAt',
      order = 'desc',
      q,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { active: true };
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    // ── Inline search: regex across name, description, tags ───────────────
    if (q && q.trim().length > 0) {
      const pattern = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: pattern },
        { description: pattern },
        { tags: { $in: [pattern] } },
      ];
    }

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/products/featured ─────────────────────────────────────────
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/products/search?q= ────────────────────────────────────────
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { active: true, $text: { $search: q.trim() } };

    const [products, total] = await Promise.all([
      Product.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/products/category/:category ───────────────────────────────
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { active: true, category };
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/products/:slug ─────────────────────────────────────────────
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/v1/products ─────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      name, shortDescription, description, price, category,
      tags, image, gallery, modelPath, texturePath, stock, featured, slug,
    } = req.body;

    // Auto-generate slug from name if not provided, ensure uniqueness
    let finalSlug = slug ? slug.toLowerCase().trim() : generateSlug(name);

    // If slug already exists, append a short suffix
    const existing = await Product.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
    }

    const product = new Product({
      slug: finalSlug,
      name, shortDescription, description, price, category,
      tags, image, gallery, modelPath, texturePath, stock,
      featured: featured || false,
      active: true,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/v1/products/:id ───────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/v1/products/:id — SOFT DELETE ─────────────────────────────
// Never hard-delete a product that may have orders. Sets active: false.
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { active: false } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deactivated', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
