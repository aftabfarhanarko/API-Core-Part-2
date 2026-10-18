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

// Middleware: Log and save User-Agent from any client
const checkUseragent = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "Unknown User-Agent";

  console.log("This User Hit Right Now:", userAgent);

  // Save user agent to userAgent.json (Browser, Postman, Thunder Client, Mobile, etc.)
  saveUserAgent(userAgent);

  // Allow all requests to proceed
  next();
};

module.exports = {
  isValid,
  checkUseragent,
};
