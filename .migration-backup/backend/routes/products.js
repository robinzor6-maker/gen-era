const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// ─── Validation rules ──────────────────────────────────────────────────────
const createRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').isIn(['clothing', 'accessories']).withMessage('Category must be clothing or accessories'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').optional().isIn(['clothing', 'accessories']).withMessage('Invalid category'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// ─── Public routes (active products only) ─────────────────────────────────
// ORDER MATTERS: specific paths must come before /:slug
router.get('/',                    productController.getAllProducts);
router.get('/featured',            productController.getFeaturedProducts);
router.get('/search',              productController.searchProducts);
router.get('/category/:category',  productController.getProductsByCategory);
router.get('/:slug',               productController.getProductBySlug);

// ─── Admin routes (authenticate + authorize('admin')) ──────────────────────
router.post(  '/',    authenticate, authorize('admin'), createRules, productController.createProduct);
router.put(   '/:id', authenticate, authorize('admin'), updateRules,  productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'),              productController.deleteProduct);

module.exports = router;
