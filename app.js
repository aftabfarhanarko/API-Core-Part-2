const express = require("express");
const cors = require("cors");
const userRouter = require("./router/user");
const  {isValid, checkUseragent} = require('./middleware/user');
const app = express();
const port = 3000;
// Enable CORS for all routes
app.use(cors());
// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Root route
app.get("/", (req, res) => {
  res.send("Server is running! Go to /api/users to see the user API.");
});



// User routes
app.use("/api/users",isValid, checkUseragent, userRouter);


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
