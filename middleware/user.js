const { saveUserAgent, saveBlockedUser } = require("../utils/logger");

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
  /curl/
];

// Middleware: Check User-Agent, extract IP, handle blocked bots into blocked.json
const checkUseragent = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "Unknown User-Agent";

  // Get Client IP address (handles proxies, localhost ::1 and ::ffff:)
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress || req.ip || "127.0.0.1";
  const ip = rawIp.replace("::ffff:", "");

  console.log(`[IP: ${ip}] User Hit: ${userAgent}`);

  // Check if User-Agent matches any blocked bot/scanner pattern
  const matchedPattern = blockedPatterns.find((pattern) => pattern.test(userAgent));

  if (matchedPattern) {
    // Save blocked attempt to blocked.json
    saveBlockedUser(userAgent, ip, `Matched pattern: ${matchedPattern.toString()}`);

    return res.status(403).json({
      success: false,
      message: "Access Denied: Your client is blocked",
    });
  }

  // Save valid hit's User-Agent to userAgent.json for tracking
  saveUserAgent(userAgent, ip);

  // Allow all other clients (Chrome, Postman, Thunder Client, mobile, etc.)
  next();
};

module.exports = {
  isValid,
  checkUseragent,
};
