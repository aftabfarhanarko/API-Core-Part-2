const fs = require("fs");
const path = require("path");

const userAgentFile = path.join(__dirname, "../userAgent.json");
const blockedFile = path.join(__dirname, "../blocked.json");
const requestLogFile = path.join(__dirname, "../loges/request.json");

/**
 * Clean and normalize IP address
 * @param {string} rawIp
 * @returns {string}
 */
const normalizeIp = (rawIp) => {
  if (!rawIp) return "127.0.0.1";
  let ip = rawIp.trim();
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  if (ip === "::1") {
    ip = "127.0.0.1";
  }
  return ip;
};

/**
 * Helper to safely read and parse JSON array from a file
 */
const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

/**
 * Save or increment legitimate client user-agent request count with IP
 * @param {string} userAgent
 * @param {string} rawIp
 */
const saveUserAgent = (userAgent, rawIp = "127.0.0.1") => {
  const ip = normalizeIp(rawIp);
  const data = readJsonFile(userAgentFile);

  const existingRecord = data.find(
    (item) => item.userAgent === userAgent && item.ip === ip
  );

  if (existingRecord) {
    existingRecord.count = (existingRecord.count || 0) + 1;
    existingRecord.lastHit = new Date().toISOString();
  } else {
    data.push({
      ip,
      userAgent,
      count: 1,
      lastHit: new Date().toISOString(),
    });
  }

  try {
    fs.writeFileSync(userAgentFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing userAgent.json:", err.message);
  }
};

/**
 * Save or increment blocked client/bot request count in blocked.json
 * @param {string} userAgent
 * @param {string} rawIp
 * @param {string} reason
 */
const saveBlockedUser = (
  userAgent,
  rawIp = "127.0.0.1",
  reason = "Blocked Pattern"
) => {
  const ip = normalizeIp(rawIp);
  const data = readJsonFile(blockedFile);

  const existingRecord = data.find(
    (item) => item.userAgent === userAgent && item.ip === ip
  );

  if (existingRecord) {
    existingRecord.count = (existingRecord.count || 0) + 1;
    existingRecord.lastAttempt = new Date().toISOString();
    existingRecord.reason = reason;
  } else {
    data.push({
      ip,
      userAgent,
      reason,
      count: 1,
      lastAttempt: new Date().toISOString(),
    });
  }

  try {
    fs.writeFileSync(blockedFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing blocked.json:", err.message);
  }
};

/**
 * Clear request audit logs or user-agent / blocked data
 * @param {string} target 'requests' | 'all'
 */
const clearLogs = (target = "requests") => {
  try {
    if (target === "requests" || target === "all") {
      if (fs.existsSync(requestLogFile)) {
        fs.writeFileSync(requestLogFile, "[]", "utf-8");
      }
    }
    if (target === "all") {
      if (fs.existsSync(userAgentFile)) {
        fs.writeFileSync(userAgentFile, "[]", "utf-8");
      }
      if (fs.existsSync(blockedFile)) {
        fs.writeFileSync(blockedFile, "[]", "utf-8");
      }
    }
    return true;
  } catch (err) {
    console.error("Error clearing logs:", err.message);
    return false;
  }
};

module.exports = {
  normalizeIp,
  readJsonFile,
  saveUserAgent,
  saveBlockedUser,
  clearLogs,
};
