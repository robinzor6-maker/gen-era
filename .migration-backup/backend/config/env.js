require('dotenv').config();

const ENV_VARS = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/gen-era',
  JWT_SECRET: process.env.JWT_SECRET || 'gen-era-secret-key-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validate critical env vars
if (!ENV_VARS.MONGO_URI) {
  console.warn('⚠ MONGO_URI not set. Using default.');
}

if (ENV_VARS.NODE_ENV === 'production' && ENV_VARS.JWT_SECRET === 'gen-era-secret-key-change-in-production') {
  console.error('✗ ERROR: JWT_SECRET must be changed in production!');
  process.exit(1);
}

module.exports = ENV_VARS;
