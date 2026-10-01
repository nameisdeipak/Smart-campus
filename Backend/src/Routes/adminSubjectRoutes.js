const express = require("express");

const router = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../Controllers/subjectController");

router.post("/createSubject", adminMiddleware, createSubject);

router.get("/getAllSubjects", adminMiddleware, getAllSubjects);

router.get("/:id", adminMiddleware, getSubjectById);

router.put("/updateSubject/:id", adminMiddleware, updateSubject);

router.delete("/deleteSubject/:id", adminMiddleware, deleteSubject);

module.exports = router;
