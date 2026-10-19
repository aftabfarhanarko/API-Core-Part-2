const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} = require("../controllers/userControllers");

// Aggregated statistics route (must be before /:id)
router.get("/stats", getUserStats);

// Collection routes
router.get("/", getAllUsers);
router.post("/", createUser);

// Single resource routes
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
