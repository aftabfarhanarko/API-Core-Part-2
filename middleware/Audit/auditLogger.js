const fs = require("fs");
const path = require("path");
const config = require("../../config");
const { normalizeIp } = require("../../utils/logger");

const logerFilePath = path.join(__dirname, "../../loges/request.json");
const logerDir = path.dirname(logerFilePath);

// Ensure log directory and file exist
if (!fs.existsSync(logerDir)) {
  fs.mkdirSync(logerDir, { recursive: true });
}

if (!fs.existsSync(logerFilePath)) {
  fs.writeFileSync(logerFilePath, "[]", "utf8");
}

let writePending = false;
let writeQueue = [];

/**
 * Flush queue safely to file with a rolling window
 */
const flushQueue = () => {
  if (writePending || writeQueue.length === 0) return;

  writePending = true;
  const entriesToWrite = [...writeQueue];
  writeQueue = [];

  fs.readFile(logerFilePath, "utf8", (err, data) => {
    let logs = [];
    if (!err && data) {
      try {
        logs = JSON.parse(data);
      } catch (parseErr) {
        logs = [];
      }
    }

    logs.push(...entriesToWrite);

    // Keep only the most recent N logs (rolling buffer)
    const maxLogs = config.maxAuditLogs || 1000;
    if (logs.length > maxLogs) {
      logs = logs.slice(logs.length - maxLogs);
    }

    fs.writeFile(logerFilePath, JSON.stringify(logs, null, 2), "utf8", (writeErr) => {
      writePending = false;
      if (writeErr) {
        console.error("Audit Logger write error:", writeErr.message);
      }
      if (writeQueue.length > 0) {
        setImmediate(flushQueue);
      }
    });
  });
};

const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  const forwarded = req.headers["x-forwarded-for"];
  const rawIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket.remoteAddress || req.ip || "127.0.0.1";
  const ip = normalizeIp(rawIp);

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      ip,
      headers: {
        "user-agent": req.headers["user-agent"] || "",
        "authorization": req.headers["authorization"] ? "[REDACTED]" : "",
        "x-api-key": req.headers["x-api-key"] ? "[REDACTED]" : "",
        "referer": req.headers["referer"] || "",
        "origin": req.headers["origin"] || "",
        "content-type": req.headers["content-type"] || "",
      },
      statusCode: res.statusCode,
      responseTime,
    };

    writeQueue.push(logEntry);
    setImmediate(flushQueue);
  });

  next();
};

module.exports = auditLogger;
