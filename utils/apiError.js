/**
 * Custom Operational API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized", errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = "Forbidden", errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = "Resource Not Found", errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = "Conflict", errors = []) {
    return new ApiError(409, message, errors);
  }

  static tooManyRequests(message = "Too Many Requests", errors = []) {
    return new ApiError(429, message, errors);
  }

  static internal(message = "Internal Server Error", errors = []) {
    return new ApiError(500, message, errors);
  }
}

module.exports = ApiError;
