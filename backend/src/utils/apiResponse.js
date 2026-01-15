/**
 * Standardized API Response Helper
 */
class ApiResponse {
  /**
   * Success response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Created response (201)
   */
  static created(res, data = null, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Error response
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  /**
   * Bad Request (400)
   */
  static badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized (401)
   */
  static unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden (403)
   */
  static forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Not Found (404)
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Conflict (409)
   */
  static conflict(res, message = 'Conflict') {
    return this.error(res, message, 409);
  }

  /**
   * Validation Error (422)
   */
  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 422, errors);
  }

  /**
   * Too Many Requests (429)
   */
  static tooManyRequests(res, message = 'Too many requests') {
    return this.error(res, message, 429);
  }

  /**
   * Internal Server Error (500)
   */
  static serverError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }

  /**
   * Paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
