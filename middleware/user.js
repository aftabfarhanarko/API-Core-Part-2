const { saveUserAgent, saveBlockedUser, normalizeIp } = require("../utils/logger");
const config = require("../config");
const ApiError = require("../utils/apiError");

/**
 * Middleware: Validate Token from Query (?token=), Header (Authorization: Bearer <token>), or x-api-key
 */
const isValid = (req, res, next) => {
  let token = null;

  // 1. Check query parameter
  if (req.query.token) {
    token = req.query.token;
  }

  // 2. Check Authorization Header (Bearer <token> or direct token)
  const authHeader = req.headers["authorization"];
  if (!token && authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else {
      token = authHeader.trim();
    }
  }

  // 3. Check x-api-key header
  if (!token && req.headers["x-api-key"]) {
    token = req.headers["x-api-key"].trim();
  }

  // Compare with allowed tokens
  if (token && config.apiTokens.includes(token)) {
    req.authenticated = true;
    req.token = token;
    return next();
  }

  return next(
    ApiError.unauthorized(
      "Unauthorized: Invalid or missing authentication token. Provide via Authorization: Bearer <token>, x-api-key header, or ?token=<token> parameter."
    )
  );
};

// Blocklist of suspicious bots / automated security scanners / scrapers
const blockedPatterns = [
  /python-requests/i,
  /Go-http-client/i,
  /Java/i,
  /sqlmap/i,
  /nmap/i,
  /Nikto/i,
  /HeadlessChrome/i,
  /PhantomJS/i,
  /curl/i,
  /masscan/i,
  /acunetix/i,
  /havij/i,
];

/**
 * Middleware: Check User-Agent, extract IP, handle blocked bots into blocked.json
 */
const checkUseragent = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "Unknown User-Agent";

  // Get and normalize client IP
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket.remoteAddress || req.ip || "127.0.0.1";
  const ip = normalizeIp(rawIp);

  // Check if User-Agent matches any blocked bot/scanner pattern
  const matchedPattern = blockedPatterns.find((pattern) => pattern.test(userAgent));

  if (matchedPattern) {
    const reason = `Matched pattern: ${matchedPattern.toString()}`;
    saveBlockedUser(userAgent, ip, reason);

    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Access Denied: Your client or user-agent has been blocked by security policies.",
      reason,
      ip,
    });
  }

  // Save legitimate hit's User-Agent to userAgent.json for tracking
  saveUserAgent(userAgent, ip);

  next();
};

module.exports = {
  isValid,
  checkUseragent,
};
