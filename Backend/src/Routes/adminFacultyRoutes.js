const express = require("express");

const adminFacultyRoutes = express.Router();

const adminMiddleware = require("../Middleware/adminMiddleware");

const {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} = require("../Controllers/facultyController");

adminFacultyRoutes.post("/createFaculty", adminMiddleware, createFaculty);

adminFacultyRoutes.get("/getAllFaculty", adminMiddleware, getAllFaculty);

adminFacultyRoutes.get("/:id", adminMiddleware, getFacultyById);

adminFacultyRoutes.put("/updateFacultyInfo/:id", adminMiddleware, updateFaculty);

adminFacultyRoutes.delete("/removeFaculty/:id", adminMiddleware, deleteFaculty);

module.exports = adminFacultyRoutes;
