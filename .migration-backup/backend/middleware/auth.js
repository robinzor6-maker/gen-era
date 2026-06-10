const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ENV_VARS = require('../config/env');

/**
 * GEN ERA — JWT Authentication Middleware
 * Attaches the full user object to req.user so authorize() can check roles.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

    // Fetch the user so we have the role available for authorize()
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
