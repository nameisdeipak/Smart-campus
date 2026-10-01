const express = require("express");
const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createStudentSubject,
  getAllStudentSubjects,
  getStudentSubjects,
  getSubjectStudents,
  updateStudentSubject,
  deleteStudentSubject,
} = require("../Controllers/studentSubjectController");

router.post(
  "/createStudentSubject",
  adminMiddleware,
  createStudentSubject
);

router.get(
  "/getAllStudentSubjects",
  adminMiddleware,
  getAllStudentSubjects
);

router.get(
  "/student/:studentId",
  adminMiddleware,
  getStudentSubjects
);

router.get(
  "/subject/:subjectId",
  adminMiddleware,
  getSubjectStudents
);

router.put(
  "/updateStudentSubject/:id",
  adminMiddleware,
  updateStudentSubject
);

router.delete(
  "/deleteStudentSubject/:id",
  adminMiddleware,
  deleteStudentSubject
);

module.exports = router;