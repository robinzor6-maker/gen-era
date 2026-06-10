const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * GEN ERA — Order Controller
 *
 * Core principle: User account ≠ Order customer
 *
 * Two flows:
 * 1. Registered: req.user exists → user = req.user._id, customerType = "registered"
 * 2. Guest:      req.user is null → user = null, customerType = "guest"
 *
 * In BOTH flows:
 * - customer object is ALWAYS saved on the order (self-contained receipt)
 * - Price, name, image, sku are ALWAYS snapshotted from the live product
 * - Stock deduction is ATOMIC via $gte + $inc (no race condition)
 *
 * ❌ No silent registration. No fake accounts. No forced login.
 */

// ─── POST /api/v1/orders ───────────────────────────────────────────────────
// Uses optionalAuth — req.user is either a User object or null.
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
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

    // ── 4. Determine customer type ──────────────────────────────────────
    const isRegistered = !!req.user;

    // ── 5. Generate unique order number ──────────────────────────────────
    const orderNumber = `ORD-${Date.now()}`;

    // ── 6. Persist order ─────────────────────────────────────────────────
    const order = await Order.create({
      orderNumber,
      user:         isRegistered ? req.user._id : null,
      customerType: isRegistered ? 'registered' : 'guest',
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
// Requires authentication (enforced at router level). Returns only the user's orders.
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
// Requires authentication. Ownership enforced: user sees own orders, admin sees all.
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user?.toString() !== req.user._id.toString()) {
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
