const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const authorize = require('../middleware/authorize');

// ─── Validation rules ──────────────────────────────────────────────────────

const createOrderRules = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Each item must have a productId'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  // Customer object validation (required for BOTH guest and registered)
  body('customer.name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid customer email is required'),
  body('customer.address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required'),
  body('customer.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('customer.phone')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];

const statusRules = [
  body('status')
    .isIn(['pending', 'paid', 'shipped', 'delivered'])
    .withMessage('Invalid order status'),
];

// ─── Guest-friendly route (optionalAuth: sets req.user if token present, null otherwise) ─
router.post('/', optionalAuth, createOrderRules, orderController.createOrder);

// ─── Authenticated routes (require login) ──────────────────────────────────
router.get('/my',  authenticate,                    orderController.getMyOrders);
router.get('/:id', authenticate,                    orderController.getOrderById);

// ─── Admin routes ──────────────────────────────────────────────────────────
router.put('/:id/status', authenticate, authorize('admin'), statusRules, orderController.updateOrderStatus);

module.exports = router;
