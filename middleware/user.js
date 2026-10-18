const { saveUserAgent } = require("../utils/logger");

// Middleware: Validate Token
const isValid = (req, res, next) => {
  console.log(req.query.token);

  if (req.query.token === "123") {
    console.log("OK.........");
    next();
  } else {
    res.status(401).json({
      message: "Unauthorized: Invalid token",
    });
  }
};

// Blocklist of suspicious bots / scanners / scrapers
const blockedPatterns = [
  /python-requests/i,
  /Go-http-client/i,
  /Java/i,
  /sqlmap/i,
  /nmap/i,
  /Nikto/i,
  /HeadlessChrome/i,
  /PhantomJS/i,
];

// Middleware: Check User-Agent and block malicious clients/bots
const checkUseragent = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "Unknown User-Agent";

  console.log("This User Hit Right Now:", userAgent);

  // Save every hit's User-Agent to userAgent.json for tracking
  saveUserAgent(userAgent);

  // Check if User-Agent matches any blocked bot/scanner pattern
  const isBlocked = blockedPatterns.some((pattern) => pattern.test(userAgent));

  if (isBlocked) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Your client is blocked",
    });
  }

  // Allow all other clients (Chrome, Postman, Thunder Client, mobile, etc.)
  next();
};

module.exports = {
  isValid,
  checkUseragent,
};
