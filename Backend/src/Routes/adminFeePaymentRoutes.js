const express = require("express");
const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createFeePayment,
  getAllFeePayments,
  getPaymentsByStudent,
  getPaymentsByStudentFee,
  getFeePaymentById,
  updateFeePayment,
  deleteFeePayment,
} = require("../Controllers/feePaymentController");

router.post(
  "/createFeePayment",
  adminMiddleware,
  createFeePayment
);

router.get(
  "/getAllFeePayments",
  adminMiddleware,
  getAllFeePayments
);

router.get(
  "/student/:studentId",
  adminMiddleware,
  getPaymentsByStudent
);

router.get(
  "/student-fee/:studentFeeId",
  adminMiddleware,
  getPaymentsByStudentFee
);

router.get(
  "/:id",
  adminMiddleware,
  getFeePaymentById
);

router.put(
  "/updateFeePayment/:id",
  adminMiddleware,
  updateFeePayment
);

router.delete(
  "/deleteFeePayment/:id",
  adminMiddleware,
  deleteFeePayment
);

module.exports = router;