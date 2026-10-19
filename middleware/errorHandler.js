const ApiError = require("../utils/apiError");
const config = require("../config");

/**
 * Global centralized error-handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Handle syntax error from malformed JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body.";
    errors = [err.message];
  }

  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  // Include stack trace only in development mode
  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
