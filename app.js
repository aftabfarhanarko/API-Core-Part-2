const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const userRouter = require("./router/user");
const { isValid, checkUseragent } = require("./middleware/user");

const app = express();
const port = 3000;

// Rate Limiter: Protect API from brute-force & DDoS (Max 100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-8", // Return standard rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Apply rate limiter globally
app.use(limiter);

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global User-Agent Logger & Malicious Bot Blocker Middleware
app.use(checkUseragent);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running! Go to /api/users to see the user API.");
});

// User routes (with Token Validation)
app.use("/api/users", isValid, userRouter);

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

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
