const express = require("express");
const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createStudentFee,
  getAllStudentFees,
  getStudentFees,
  getStudentFeeById,
  updateStudentFee,
  deleteStudentFee,
} = require("../Controllers/studentFeeController");

router.post(
  "/createStudentFee",
  adminMiddleware,
  createStudentFee
);

router.get(
  "/getAllStudentFees",
  adminMiddleware,
  getAllStudentFees
);

router.get(
  "/student/:studentId",
  adminMiddleware,
  getStudentFees
);

router.get(
  "/:id",
  adminMiddleware,
  getStudentFeeById
);

router.put(
  "/updateStudentFee/:id",
  adminMiddleware,
  updateStudentFee
);

router.delete(
  "/deleteStudentFee/:id",
  adminMiddleware,
  deleteStudentFee
);

module.exports = router;