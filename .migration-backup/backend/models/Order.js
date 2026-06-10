const mongoose = require('mongoose');

/**
 * GEN ERA — Order Model
 *
 * Design rules:
 * - customerType: "registered" (linked to User) or "guest" (no account).
 * - user field is OPTIONAL — null for guest orders.
 * - orderNumber is generated server-side (ORD-<timestamp>), unique.
 * - items are SNAPSHOTS: name, price, image, sku captured at order creation time.
 *   They NEVER reference live product data after creation.
 * - customer object stores delivery details directly on the order (immutable record).
 *   Present on BOTH guest and registered orders — the order is a self-contained receipt.
 *
 * Core principle: User account ≠ Order customer
 *   - Order can exist without User (guest)
 *   - User can exist without Order (browsing only)
 *   - Both can be linked (registered user places order)
 */

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // reference only — for analytics, never for display pricing
    },
    // ─── SNAPSHOTS — immutable financial record ─────────────────────────────
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    image:    { type: String, default: '' },
    sku:      { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ─── Identity ─────────────────────────────────────────────────────────
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // ─── Ownership (nullable for guest orders) ────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,     // null = guest order
      index: true,
    },
    customerType: {
      type: String,
      enum: ['guest', 'registered'],
      required: true,
    },

    // ─── Delivery info (always present — self-contained receipt) ──────────
    customer: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      phone:   { type: String, default: '' },
      address: { type: String, required: true },
      city:    { type: String, required: true },
    },

    // ─── Line items (all snapshots) ───────────────────────────────────────
    items: [orderItemSchema],

    // ─── Financials ───────────────────────────────────────────────────────
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ─── Delivery notes ───────────────────────────────────────────────────
    notes: {
      type: String,
      default: '',
    },

    // ─── Lifecycle ────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentRef: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customerType: 1 });
orderSchema.index({ 'customer.email': 1 });

module.exports = mongoose.model('Order', orderSchema);
