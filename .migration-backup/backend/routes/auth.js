const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// ─── Rate limiting — 10 requests / 15 min on auth endpoints ───────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again in 15 minutes.' },
});

// ─── Validation rules ──────────────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Public routes ─────────────────────────────────────────────────────────
router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login',    authLimiter, loginRules,    authController.login);

// ─── Protected routes ──────────────────────────────────────────────────────
router.get('/profile',  authenticate, authController.getProfile);
router.put('/profile',  authenticate, authController.updateProfile);

module.exports = router;
