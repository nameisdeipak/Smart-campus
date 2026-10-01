const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
} = require("../Controllers/semesterController");

router.post(
  "/createSemester",
  adminMiddleware,
  createSemester
);

router.get(
  "/getAllSemesters",
  adminMiddleware,
  getAllSemesters
);

router.get(
  "/:id",
  adminMiddleware,
  getSemesterById
);

router.put(
  "/updateSemester/:id",
  adminMiddleware,
  updateSemester
);

router.delete(
  "/deleteSemester/:id",
  adminMiddleware,
  deleteSemester
);

module.exports = router;