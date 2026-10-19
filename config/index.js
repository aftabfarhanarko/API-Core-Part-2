require("dotenv").config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 5,
  },
  apiTokens: (process.env.API_TOKENS || "123,dev-secret-token")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
  maxAuditLogs: parseInt(process.env.MAX_AUDIT_LOGS, 10) || 1000,
};

module.exports = config;
