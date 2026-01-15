require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      basicMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
      basicYearly: process.env.STRIPE_PRICE_BASIC_YEARLY,
      proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      proYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
      enterpriseMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
      enterpriseYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
    },
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'VetSaaS <noreply@vetsaas.com>',
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    path: process.env.UPLOAD_PATH || './src/uploads',
  },

  // URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:8081',
    backend: process.env.BACKEND_URL || 'http://localhost:3000',
  },

  // Trial
  trialDays: parseInt(process.env.TRIAL_DAYS, 10) || 14,

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
};

// Validate required configuration
const requiredConfig = ['jwt.secret', 'jwt.refreshSecret'];
requiredConfig.forEach((key) => {
  const keys = key.split('.');
  let value = config;
  keys.forEach((k) => {
    value = value?.[k];
  });
  if (!value && config.env === 'production') {
    throw new Error(`Missing required configuration: ${key}`);
  }
});

module.exports = config;
