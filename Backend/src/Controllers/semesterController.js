const Semester = require("../Models/semester");
const Course = require("../Models/course");
const Branch = require("../Models/branch");

// Create Semester
const createSemester = async (req, res) => {
  try {
    const {
      courseId,
      branchId,
      semesterNumber,
      semesterName,
    } = req.body;

    if (
      !courseId ||
      !branchId ||
      !semesterNumber ||
      !semesterName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, branch, semester number and semester name are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot create semester under an inactive course",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (!branch.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot create semester under an inactive branch",
      });
    }

    if (branch.courseId.toString() !== courseId.toString()) {
      return res.status(400).json({
        success: false,
        message:
          "Selected branch does not belong to the selected course",
      });
    }

    const existingSemester = await Semester.findOne({
      branchId,
      semesterNumber,
    });

    if (existingSemester) {
      return res.status(409).json({
        success: false,
        message:
          "This semester already exists for the selected branch",
      });
    }

    const semester = await Semester.create({
      courseId,
      branchId,
      semesterNumber,
      semesterName: semesterName.trim(),
    });

    const populatedSemester = await Semester.findById(
      semester._id
    )
      .populate("courseId", "courseCode courseName")
      .populate(
        "branchId",
        "branchCode branchName"
      );

    return res.status(201).json({
      success: true,
      message: "Semester created successfully",
      semester: populatedSemester,
    });
  } catch (error) {
    console.error("CREATE SEMESTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This semester already exists for the selected branch",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create semester",
    });
  }
};

// Get All Semesters
const getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find()
      .populate(
        "courseId",
        "courseCode courseName courseType"
      )
      .populate(
        "branchId",
        "branchCode branchName"
      )
      .sort({
        branchId: 1,
        semesterNumber: 1,
      });

    return res.status(200).json({
      success: true,
      semesters,
    });
  } catch (error) {
    console.error("GET ALL SEMESTERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch semesters",
    });
  }
};

// Get Semester By ID
const getSemesterById = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id)
      .populate(
        "courseId",
        "courseCode courseName courseType"
      )
      .populate(
        "branchId",
        "branchCode branchName"
      );

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    return res.status(200).json({
      success: true,
      semester,
    });
  } catch (error) {
    console.error("GET SEMESTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch semester",
    });
  }
};

// Update Semester
const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      courseId,
      branchId,
      semesterNumber,
      semesterName,
      isActive,
    } = req.body;

    const semester = await Semester.findById(id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    if (
      !courseId ||
      !branchId ||
      !semesterNumber ||
      !semesterName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, branch, semester number and semester name are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (
      branch.courseId.toString() !==
      courseId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected branch does not belong to the selected course",
      });
    }

    if (
      isActive &&
      (!course.isActive || !branch.isActive)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot activate semester under an inactive course or branch",
      });
    }

    const duplicateSemester = await Semester.findOne({
      _id: { $ne: id },
      branchId,
      semesterNumber,
    });

    if (duplicateSemester) {
      return res.status(409).json({
        success: false,
        message:
          "Another semester with this number already exists for the selected branch",
      });
    }

    semester.courseId = courseId;
    semester.branchId = branchId;
    semester.semesterNumber = semesterNumber;
    semester.semesterName = semesterName.trim();

    if (typeof isActive === "boolean") {
      semester.isActive = isActive;
    }

    await semester.save();

    const updatedSemester = await Semester.findById(id)
      .populate(
        "courseId",
        "courseCode courseName courseType"
      )
      .populate(
        "branchId",
        "branchCode branchName"
      );

    return res.status(200).json({
      success: true,
      message: "Semester updated successfully",
      semester: updatedSemester,
    });
  } catch (error) {
    console.error("UPDATE SEMESTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This semester already exists for the selected branch",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update semester",
    });
  }
};

// Delete Semester
const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    await Semester.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Semester deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SEMESTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete semester",
    });
  }
};

module.exports = {
  createSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
};