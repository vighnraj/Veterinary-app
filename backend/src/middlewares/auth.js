const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Access token required');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Token expired');
      }
      return ApiResponse.unauthorized(res, 'Invalid token');
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        account: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    if (!user.isActive) {
      return ApiResponse.unauthorized(res, 'Account is deactivated');
    }

    if (user.deletedAt) {
      return ApiResponse.unauthorized(res, 'Account has been deleted');
    }

    // Check subscription status
    const account = user.account;
    if (!account.isActive) {
      return ApiResponse.forbidden(res, 'Account is suspended');
    }

    // Check trial or subscription
    const now = new Date();
    const isTrialing = account.subscriptionStatus === 'trialing';
    const isActive = account.subscriptionStatus === 'active';
    const trialExpired = isTrialing && account.trialEndsAt && account.trialEndsAt < now;
    const subscriptionExpired = !isTrialing && account.subscriptionEndsAt && account.subscriptionEndsAt < now;

    if (trialExpired) {
      return ApiResponse.forbidden(res, 'Trial period has expired. Please subscribe to continue.');
    }

    if (subscriptionExpired || account.subscriptionStatus === 'canceled') {
      return ApiResponse.forbidden(res, 'Subscription has expired. Please renew to continue.');
    }

    if (account.subscriptionStatus === 'past_due') {
      // Allow limited access for past due, but warn
      req.subscriptionWarning = 'Payment is past due. Please update your payment method.';
    }

    // Attach user and account to request
    req.user = user;
    req.account = account;
    req.accountId = account.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return ApiResponse.serverError(res, 'Authentication error');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          account: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (user && user.isActive && !user.deletedAt) {
        req.user = user;
        req.account = user.account;
        req.accountId = user.account.id;
      }
    } catch (error) {
      // Token invalid, continue without auth
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    // Owner and admin have all permissions
    if (['owner', 'admin'].includes(req.user.role)) {
      return next();
    }

    // Check custom permissions
    const userPermissions = req.user.permissions || {};
    if (userPermissions[permission] !== true) {
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Check feature access based on plan
 */
const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.account || !req.account.plan) {
      return ApiResponse.forbidden(res, 'Subscription required');
    }

    const features = req.account.plan.features || {};
    if (!features[feature]) {
      return ApiResponse.forbidden(
        res,
        `This feature requires a higher plan. Please upgrade to access ${feature}.`
      );
    }

    next();
  };
};

/**
 * Rate limiting per account
 */
const accountRateLimit = (maxRequests, windowMs) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.accountId) {
      return next();
    }

    const key = req.accountId;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request array
    let accountRequests = requests.get(key) || [];

    // Filter out old requests
    accountRequests = accountRequests.filter((time) => time > windowStart);

    if (accountRequests.length >= maxRequests) {
      return ApiResponse.tooManyRequests(res, 'Too many requests. Please try again later.');
    }

    // Add current request
    accountRequests.push(now);
    requests.set(key, accountRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      const cleanupThreshold = now - windowMs * 2;
      for (const [k, v] of requests.entries()) {
        const filtered = v.filter((time) => time > cleanupThreshold);
        if (filtered.length === 0) {
          requests.delete(k);
        } else {
          requests.set(k, filtered);
        }
      }
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  requireFeature,
  accountRateLimit,
};
