const express = require("express");
const userRouter = require("./router/user");

const app = express();
const port = 3000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Server is running! Go to /users to see the user API.");
});
app.use("/users", userRouter);

// 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});



app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
