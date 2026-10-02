const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  getStudentRiskPrediction,
  getAIOverview,
  getRiskAnalysis,
  getCompleteAnalytics,
} = require("../Controllers/aiAnalyticsController");


router.get(
  "/overview",
  adminMiddleware,
  getAIOverview
);


router.get(
  "/risk-analysis",
  adminMiddleware,
  getRiskAnalysis
);


router.get(
  "/complete",
  adminMiddleware,
  getCompleteAnalytics
);


router.get(
  "/student-risk/:studentId",
  adminMiddleware,
  getStudentRiskPrediction
);


module.exports = router;