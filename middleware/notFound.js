const ApiError = require("../utils/apiError");

/**
 * 404 Not Found Handler for undefined routes
 */
const notFound = (req, res, next) => {
  next(
    ApiError.notFound(
      `Route '${req.method} ${req.originalUrl}' does not exist on this server.`
    )
  );
};

module.exports = notFound;
