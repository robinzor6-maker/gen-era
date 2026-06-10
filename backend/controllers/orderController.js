const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * GEN ERA — Order Controller
 *
 * Security rules:
 * - Price/name are ALWAYS snapshotted from the live product at order creation time.
 * - A user can only see their own orders (ownership enforced).
 * - Only admins can update order status.
 */

// ─── POST /api/v1/orders ───────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    let totalPrice = 0;
    const snapshotItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.active) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found or unavailable`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}"`,
        });
      }

      // SNAPSHOT — price and name are captured now, not referenced later
      snapshotItems.push({
        product: product._id,
        name: product.name,       // SNAPSHOT
        price: product.price,     // SNAPSHOT
        image: product.image,     // SNAPSHOT
        sku: product.slug,        // SNAPSHOT
        quantity: item.quantity,
      });

      totalPrice += product.price * item.quantity;
    }

    const order = new Order({
      user: req.user._id,
      items: snapshotItems,
      totalPrice,
      shippingAddress,
    });

    await order.save();
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/v1/orders/my ─────────────────────────────────────────────────
// Returns orders for the currently authenticated user (paginated)
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { user: req.user._id };
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
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

// ─── GET /api/v1/orders/:id ────────────────────────────────────────────────
// Ownership enforced: user can only see their own order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check — admins bypass this
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/v1/orders/:id/status ─────────────────────────────────────────
// Admin only (enforced at router level via authorize('admin'))
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
