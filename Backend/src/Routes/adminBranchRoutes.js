const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../Controllers/branchController");

router.post(
  "/createBranch",
  adminMiddleware,
  createBranch
);

router.get(
  "/getAllBranches",
  adminMiddleware,
  getAllBranches
);

router.get(
  "/:id",
  adminMiddleware,
  getBranchById
);

router.put(
  "/updateBranch/:id",
  adminMiddleware,
  updateBranch
);

router.delete(
  "/deleteBranch/:id",
  adminMiddleware,
  deleteBranch
);

module.exports = router;