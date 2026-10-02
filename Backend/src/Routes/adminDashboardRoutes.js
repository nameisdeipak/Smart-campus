const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  getDashboardStats,
} = require("../Controllers/dashboardController");

router.get(
  "/stats",
  adminMiddleware,
  getDashboardStats
);

module.exports = router;