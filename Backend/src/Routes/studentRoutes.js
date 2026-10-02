const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/authMiddleware");
const {
  getMyStudent,
  getMyAttendance,
  getMyPerformance,
  getMyFees,
  getMyCertificates,
  getMyTimetable,
  getMyHelpdesk,
  createHelpdeskTicket,
  getMyAI,
} = require("../Controllers/studentDashboardController");
const {
  createFeeOrder,
  verifyFeePayment,
  cancelFeeOrder,
} = require("../Controllers/studentPaymentController");
const { chatWithStudentAI } = require("../Controllers/studentAIController");

router.use(authMiddleware);
router.get("/me", getMyStudent);
router.get("/dashboard", getMyStudent);
router.get("/attendance", getMyAttendance);
router.get("/performance", getMyPerformance);
router.get("/fees", getMyFees);
router.post("/fees/:studentFeeId/payment-order", createFeeOrder);
router.post("/fees/verify-payment", verifyFeePayment);
router.post("/fees/cancel-order", cancelFeeOrder);
router.get("/certificates", getMyCertificates);
router.get("/timetable", getMyTimetable);
router.get("/helpdesk", getMyHelpdesk);
router.post("/helpdesk", createHelpdeskTicket);
router.get("/ai", getMyAI);
router.post("/ai/chat", chatWithStudentAI);

module.exports = router;
