const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { rateLimit } = require("express-rate-limit");
const userRouter = require("./router/user");
const { isValid, checkUseragent } = require("./middleware/user");

const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Rate Limiter: ১ সেকেন্ডে একই IP থেকে সর্বোচ্চ ২টি রিকোয়েস্ট (২টির বেশি আসলে ব্লক)
const limiter = rateLimit({
  windowMs: 5000,
  limit: 2,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: "Too many requests from this IP! Maximum 2 requests per second allowed.",
  },
});

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTML Analytics Dashboard Route
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Analytics API for the Dashboard (returns userAgent.json & blocked.json data)
app.get("/api/analytics", (req, res) => {
  const readData = (filePath) => {
    try {
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, "utf-8");
      return content.trim() ? JSON.parse(content) : [];
    } catch (e) {
      return [];
    }
  };

  const allowed = readData(path.join(__dirname, "userAgent.json"));
  const blocked = readData(path.join(__dirname, "blocked.json"));

  res.json({
    success: true,
    data: {
      allowed,
      blocked,
      totalAllowedCount: allowed.reduce((acc, curr) => acc + (curr.count || 0), 0),
      totalBlockedCount: blocked.reduce((acc, curr) => acc + (curr.count || 0), 0),
    },
  });
});

// User-Agent Logger & Malicious Bot Blocker (runs for API endpoints)
app.use(checkUseragent);

// Global Rate Limiter: সব রিকোয়েস্টের ওপর অ্যাপ্লাই হবে
app.use(limiter);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running! Go to /dashboard to view the live analytics dashboard or /api/users to test the API.");
});

// User routes with token validation (supports both /api/users and /api/user)
app.use(["/api/users", "/api/user"], isValid, userRouter);

// 404 Route Not Found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📊 Analytics Dashboard: http://localhost:${port}/dashboard`);
});
