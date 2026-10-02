const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../Controllers/courseController");

router.post(
  "/createCourse",
  adminMiddleware,
  createCourse
);

router.get(
  "/getAllCourses",
  adminMiddleware,
  getAllCourses
);

router.get(
  "/:id",
  adminMiddleware,
  getCourseById
);

router.put(
  "/updateCourse/:id",
  adminMiddleware,
  updateCourse
);

router.delete(
  "/deleteCourse/:id",
  adminMiddleware,
  deleteCourse
);

module.exports = router;