const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ENV_VARS = require('../config/env');

/**
 * GEN ERA — Optional JWT Authentication Middleware
 *
 * Unlike `authenticate`, this middleware NEVER rejects a request.
 * - If a valid Bearer token is present → req.user is set to the full user object.
 * - If no token or invalid token → req.user = null.
 *
 * Used on routes that support both guest and registered flows (e.g. POST /orders).
 */
const optionalAuth = async (req, res, next) => {
  req.user = null; // default: guest

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) {
      req.user = user;
    }
  } catch {
    // Invalid/expired token — treat as guest, don't reject
  }

  next();
};

module.exports = optionalAuth;
