const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createParent,
  getAllParents,
  getParentById,
  getParentByStudent,
  updateParent,
  deleteParent,
} = require("../Controllers/parentController");

router.post(
  "/createParent",
  adminMiddleware,
  createParent
);

router.get(
  "/getAllParents",
  adminMiddleware,
  getAllParents
);

router.get(
  "/student/:studentId",
  adminMiddleware,
  getParentByStudent
);

router.get(
  "/:id",
  adminMiddleware,
  getParentById
);

router.put(
  "/updateParent/:id",
  adminMiddleware,
  updateParent
);

router.delete(
  "/deleteParent/:id",
  adminMiddleware,
  deleteParent
);

module.exports = router;