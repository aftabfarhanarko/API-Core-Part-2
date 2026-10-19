const fs = require("fs");
const path = require("path");

const userAgentFile = path.join(__dirname, "../userAgent.json");
const blockedFile = path.join(__dirname, "../blocked.json");

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
 * @param {string} ip
 */
const saveUserAgent = (userAgent, ip = "127.0.0.1") => {
  const data = readJsonFile(userAgentFile);

  // Find existing record matching both userAgent and IP
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

  fs.writeFileSync(userAgentFile, JSON.stringify(data, null, 2));
};

/**
 * Save or increment blocked client/bot request count in blocked.json
 * @param {string} userAgent
 * @param {string} ip
 * @param {string} reason
 */
const saveBlockedUser = (
  userAgent,
  ip = "127.0.0.1",
  reason = "Blocked Pattern"
) => {
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

  fs.writeFileSync(blockedFile, JSON.stringify(data, null, 2));
};

module.exports = {
  saveUserAgent,
  saveBlockedUser,
};
