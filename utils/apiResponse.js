/**
 * Standardized API Response Helper
 */
class ApiResponse {
  static success(res, { statusCode = 200, message = "Success", data = null, meta = null }) {
    const payload = {
      success: true,
      statusCode,
      message,
      data,
    };

    if (meta !== null) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  static error(res, { statusCode = 500, message = "Something went wrong", errors = [] }) {
    const payload = {
      success: false,
      statusCode,
      message,
    };

    if (errors && errors.length > 0) {
      payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
