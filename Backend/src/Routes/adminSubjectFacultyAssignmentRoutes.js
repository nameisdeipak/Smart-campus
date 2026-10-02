const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createAssignment,
  getAllAssignments,
  getAssignmentsBySubject,
  updateAssignment,
  deleteAssignment,
} = require("../Controllers/subjectFacultyAssignmentController");

router.post(
  "/createAssignment",
  adminMiddleware,
  createAssignment,
);

router.get(
  "/getAllAssignments",
  adminMiddleware,
  getAllAssignments,
);

router.get(
  "/subject/:subjectId",
  adminMiddleware,
  getAssignmentsBySubject,
);

router.put(
  "/updateAssignment/:id",
  adminMiddleware,
  updateAssignment,
);

router.delete(
  "/deleteAssignment/:id",
  adminMiddleware,
  deleteAssignment,
);

module.exports = router;