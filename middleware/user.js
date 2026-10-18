// Middleware
const isValid = (req, res, next) => {
  console.log(req.query.token);
  if (req.query.token === "123") {
    console.log("OK.........");

    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const checkUseragent = (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  console.log("This User Hit  Right Now", userAgent);

  if (!userAgent) {
    return res
      .status(400)
      .json({ message: "Bad Request: Missing User-Agent header" });
  };
  next();
};

module.exports = {
  isValid,
  checkUseragent,
};
