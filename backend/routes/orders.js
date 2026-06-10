const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// ─── Validation rules ──────────────────────────────────────────────────────
const createOrderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Each item must have a productId'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.name').optional().trim(),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
];

const statusRules = [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

// ─── All order routes require authentication ───────────────────────────────
router.use(authenticate);

// ─── User routes ───────────────────────────────────────────────────────────
router.post('/',    createOrderRules, orderController.createOrder);
router.get('/my',                    orderController.getMyOrders);
router.get('/:id',                   orderController.getOrderById);  // ownership enforced in controller

// ─── Admin routes ──────────────────────────────────────────────────────────
router.put('/:id/status', authorize('admin'), statusRules, orderController.updateOrderStatus);

module.exports = router;
