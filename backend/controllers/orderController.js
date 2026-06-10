const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * GEN ERA — Order Controller (Phase 1 Hardened)
 *
 * Security rules enforced:
 * - Authentication is mandatory on every route (enforced at router level via authenticate).
 * - req.user is always verified before any DB write.
 * - Price, name, image, sku are ALWAYS snapshotted from the live product at order time.
 * - Stock deduction is ATOMIC via findOneAndUpdate with $gte guard to prevent overselling
 *   under concurrent load (no check-then-act race condition).
 * - No guest users. No auto-registration. customerType is always "registered".
 */

// ─── POST /api/v1/orders ───────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  // Auth guard — belt-and-suspenders check (router-level authenticate already ran)
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Login required to place orders' });
  }

  try {
    const { customer, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    let totalPrice = 0;
    const snapshotItems = [];

    for (const item of items) {
      // ── 1. Fetch product for snapshot data ─────────────────────────────
      const product = await Product.findOne({
        _id: item.productId,
        active: true,
      }).select('name price image slug stock');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found or unavailable`,
        });
      }

      // ── 2. ATOMIC stock deduction — prevents overselling under concurrent load ─
      // The $gte guard and $inc are a single atomic MongoDB operation.
      // If stock < quantity, modifiedCount = 0 and the order is rejected.
      const stockResult = await Product.updateOne(
        { _id: item.productId, active: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (!stockResult.modifiedCount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}"`,
        });
      }

      // ── 3. SNAPSHOT — captured at order time, never read again ───────────
      snapshotItems.push({
        product: product._id,
        name:     product.name,   // SNAPSHOT
        price:    product.price,  // SNAPSHOT
        image:    product.image,  // SNAPSHOT
        sku:      product.slug,   // SNAPSHOT
        quantity: item.quantity,
      });

      totalPrice += product.price * item.quantity;
    }

    // ── 4. Generate unique order number ──────────────────────────────────
    const orderNumber = `ORD-${Date.now()}`;

    // ── 5. Persist order ─────────────────────────────────────────────────
    const order = await Order.create({
      orderNumber,
      user:         req.user._id,
      customerType: 'registered',
      customer,
      items:        snapshotItems,
      totalPrice,
      notes:        notes || '',
      status:       'pending',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/orders/my ─────────────────────────────────────────────────
// Returns paginated orders for the currently authenticated user.
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page:  pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/orders/:id ────────────────────────────────────────────────
// Ownership enforced: user can only see their own order. Admins bypass this.
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/v1/orders/:id/status ─────────────────────────────────────────
// Admin only (enforced at router level via authorize('admin')).
exports.updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
