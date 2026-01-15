const config = require('../config');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`);

  if (config.env === 'development') {
    logger.error(err.stack);
  }

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const field = err.meta?.target?.[0] || 'field';
        return ApiResponse.conflict(res, `A record with this ${field} already exists`);

      case 'P2003':
        // Foreign key constraint violation
        return ApiResponse.badRequest(res, 'Related record not found');

      case 'P2025':
        // Record not found
        return ApiResponse.notFound(res, 'Record not found');

      case 'P2014':
        // Required relation violation
        return ApiResponse.badRequest(res, 'Required relation is missing');

      default:
        if (config.env === 'development') {
          return ApiResponse.error(res, `Database error: ${err.code}`, 500);
        }
        return ApiResponse.serverError(res);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.validationError(res, err.errors, err.message);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ApiResponse.badRequest(res, 'File size too large');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return ApiResponse.badRequest(res, 'Too many files');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiResponse.badRequest(res, 'Unexpected file field');
  }

  // Operational errors (our custom AppError)
  if (err.isOperational) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Unknown errors
  if (config.env === 'development') {
    return ApiResponse.error(res, err.message, 500, { stack: err.stack });
  }

  // Production: don't leak error details
  return ApiResponse.serverError(res);
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
