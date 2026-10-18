const fs = require("fs");
const path = require("path");

const userAgentFile = path.join(__dirname, "../userAgent.json");

const saveUserAgent = (agentString) => {
  let data = [];

  if (fs.existsSync(userAgentFile)) {
    const raw = fs.readFileSync(userAgentFile, "utf-8");
    if (raw.trim()) {
      try {
        data = JSON.parse(raw);
        if (!Array.isArray(data)) {
          data = [];
        }
      } catch (err) {
        data = [];
      }
    }
  }

  data.push(agentString);
  fs.writeFileSync(userAgentFile, JSON.stringify(data, null, 2));
};

module.exports = { saveUserAgent };