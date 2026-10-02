const express = require("express");
const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} = require("../Controllers/feeStructureController");

router.post(
  "/createFeeStructure",
  adminMiddleware,
  createFeeStructure
);

router.get(
  "/getAllFeeStructures",
  adminMiddleware,
  getAllFeeStructures
);

router.get(
  "/:id",
  adminMiddleware,
  getFeeStructureById
);

router.put(
  "/updateFeeStructure/:id",
  adminMiddleware,
  updateFeeStructure
);

router.delete(
  "/deleteFeeStructure/:id",
  adminMiddleware,
  deleteFeeStructure
);

module.exports = router;