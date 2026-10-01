const express = require("express");
const adminStudentRoutes  = express.Router();

const adminMiddleware=require('../Middleware/adminMiddleware')
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../Controllers/studentController");

adminStudentRoutes .post("/createStudent", adminMiddleware, createStudent);

adminStudentRoutes .get("/getAllStudent", adminMiddleware, getAllStudents);

adminStudentRoutes .get("/:id", adminMiddleware, getStudentById);

adminStudentRoutes .put("/updateStudentInfo/:id", adminMiddleware, updateStudent);

adminStudentRoutes .delete("/removeStudent/:id", adminMiddleware, deleteStudent);

module.exports = adminStudentRoutes ;
