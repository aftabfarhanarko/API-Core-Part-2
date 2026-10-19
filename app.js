const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { rateLimit } = require("express-rate-limit");
const config = require("./config");
const userRouter = require("./router/user");
const { isValid, checkUseragent } = require("./middleware/user");
const auditLogger = require("./middleware/Audit/auditLogger");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const ApiResponse = require("./utils/apiResponse");
const { readJsonFile, clearLogs } = require("./utils/logger");

const app = express();
const port = config.port;

// Trust reverse proxy (e.g., Nginx, Heroku, Cloudflare)
app.set("trust proxy", 1);

// Disable X-Powered-By for security
app.disable("x-powered-by");

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Enable CORS with configuration
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Audit Logger: captures all incoming requests and measures duration
app.use(auditLogger);

// Serve static assets from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Rate Limiter configuration
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: `Too many requests from this IP! Maximum ${config.rateLimit.max} requests per ${
      config.rateLimit.windowMs / 1000
    }s allowed.`,
  },
});

// HTML Analytics Dashboard Route
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Apply Malicious Bot Blocker & Rate Limiter to all API endpoints
app.use("/api", checkUseragent);
app.use("/api", limiter);

// System Health Check Endpoint
app.get("/api/health", (req, res) => {
  const memory = process.memoryUsage();
  return ApiResponse.success(res, {
    statusCode: 200,
    message: "System is healthy and operational",
    data: {
      status: "UP",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memory: {
        rssMB: +(memory.rss / (1024 * 1024)).toFixed(2),
        heapTotalMB: +(memory.heapTotal / (1024 * 1024)).toFixed(2),
        heapUsedMB: +(memory.heapUsed / (1024 * 1024)).toFixed(2),
      },
    },
  });
});

// Analytics API for Dashboard
app.get("/api/analytics", (req, res) => {
  const allowed = readJsonFile(path.join(__dirname, "userAgent.json"));
  const blocked = readJsonFile(path.join(__dirname, "blocked.json"));
  const requests = readJsonFile(path.join(__dirname, "loges", "request.json"));

  // Calculate rich stats from audit logs
  const statusCounts = {};
  const methodCounts = {};
  let totalResponseTime = 0;
  let requestsWithDuration = 0;
  const latencyBuckets = { "<10ms": 0, "10-50ms": 0, "50-200ms": 0, ">200ms": 0 };

  requests.forEach((r) => {
    // Status counts
    const status = r.statusCode || "unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    // Method counts
    const method = r.method || "OTHER";
    methodCounts[method] = (methodCounts[method] || 0) + 1;

    // Response time
    if (typeof r.responseTime === "number") {
      totalResponseTime += r.responseTime;
      requestsWithDuration++;

      if (r.responseTime < 10) latencyBuckets["<10ms"]++;
      else if (r.responseTime <= 50) latencyBuckets["10-50ms"]++;
      else if (r.responseTime <= 200) latencyBuckets["50-200ms"]++;
      else latencyBuckets[">200ms"]++;
    }
  });

  const avgResponseTime = requestsWithDuration
    ? +(totalResponseTime / requestsWithDuration).toFixed(2)
    : 0;

  const totalAllowedCount = allowed.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalBlockedCount = blocked.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Analytics data retrieved successfully",
    data: {
      allowed,
      blocked,
      requests,
      totalAllowedCount,
      totalBlockedCount,
      stats: {
        totalRequestsLog: requests.length,
        avgResponseTimeMs: avgResponseTime,
        statusCounts,
        methodCounts,
        latencyBuckets,
      },
    },
  });
});

// Clear Logs API Endpoint
app.post("/api/analytics/clear", (req, res) => {
  const target = req.query.target || req.body?.target || "requests";
  const ok = clearLogs(target);

  if (ok) {
    return ApiResponse.success(res, {
      statusCode: 200,
      message: `Logs cleared successfully for target: ${target}`,
    });
  } else {
    return ApiResponse.error(res, {
      statusCode: 500,
      message: "Failed to clear logs",
    });
  }
});

// Export Logs as JSON or CSV
app.get("/api/analytics/export", (req, res) => {
  const format = (req.query.format || "json").toLowerCase();
  const requests = readJsonFile(path.join(__dirname, "loges", "request.json"));

  if (format === "csv") {
    const headers = ["timestamp", "method", "url", "ip", "statusCode", "responseTime", "userAgent"];
    const rows = requests.map((r) => [
      `"${r.timestamp || ""}"`,
      `"${r.method || ""}"`,
      `"${r.url || ""}"`,
      `"${r.ip || ""}"`,
      r.statusCode || "",
      r.responseTime || "",
      `"${(r.headers && r.headers["user-agent"]) || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="audit-requests.csv"');
    return res.status(200).send(csvContent);
  }

  // Default: JSON download
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", 'attachment; filename="audit-requests.json"');
  return res.status(200).json(requests);
});

// API Documentation & Root Information
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Enterprise Secure User Management REST API",
    version: "2.0.0",
    status: "Operational",
    endpoints: {
      dashboard: "/dashboard",
      health: "/api/health",
      analytics: "/api/analytics",
      userManagement: {
        listUsers: "GET /api/users?token=123 (options: page, limit, search, role, sortBy, sortOrder)",
        userStats: "GET /api/users/stats?token=123",
        getUser: "GET /api/users/:id?token=123",
        createUser: "POST /api/users?token=123",
        updateUser: "PUT /api/users/:id?token=123",
        deleteUser: "DELETE /api/users/:id?token=123",
      },
      authMethods: [
        "Header: Authorization: Bearer 123",
        "Header: x-api-key: 123",
        "Query Parameter: ?token=123",
      ],
    },
    documentation: "/dashboard",
  });
});

// Protected User routes
app.use(["/api/users", "/api/user"], isValid, userRouter);

// 404 Handler for undefined routes
app.use(notFound);

// Global Centralized Error Handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 [Enterprise API] Server is running on http://localhost:${port}`);
    console.log(`📊 [Analytics & Studio] Dashboard: http://localhost:${port}/dashboard`);
    console.log(`🩺 [Health Check] Endpoint: http://localhost:${port}/api/health`);
  });
}

module.exports = app;