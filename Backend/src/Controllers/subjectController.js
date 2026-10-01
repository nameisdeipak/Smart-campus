const Subject = require("../Models/subject");
const Course = require("../Models/course");
const Branch = require("../Models/branch");
const Semester = require("../Models/semester");

// Create Subject
const createSubject = async (req, res) => {
  try {
    const {
      courseId,
      branchId,
      semesterId,
      subjectCode,
      subjectName,
      subjectType,
      credits,
      maxMarks,
      passingMarks,
    } = req.body;

    if (
      !courseId ||
      !branchId ||
      !semesterId ||
      !subjectCode ||
      !subjectName ||
      !subjectType ||
      credits === undefined ||
      maxMarks === undefined ||
      passingMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, branch, semester, subject code, subject name, type, credits, maximum marks and passing marks are required",
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
        message:
          "Cannot create subject under an inactive course",
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
        message:
          "Cannot create subject under an inactive branch",
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

    const semester = await Semester.findById(
      semesterId
    );

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    if (!semester.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot create subject under an inactive semester",
      });
    }

    if (
      semester.courseId.toString() !==
      courseId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected semester does not belong to the selected course",
      });
    }

    if (
      semester.branchId.toString() !==
      branchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected semester does not belong to the selected branch",
      });
    }

    if (passingMarks > maxMarks) {
      return res.status(400).json({
        success: false,
        message:
          "Passing marks cannot be greater than maximum marks",
      });
    }

    const normalizedCode =
      subjectCode.trim().toUpperCase();

    const existingSubject =
      await Subject.findOne({
        semesterId,
        subjectCode: normalizedCode,
      });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for the selected semester",
      });
    }

    const subject = await Subject.create({
      courseId,
      branchId,
      semesterId,
      subjectCode: normalizedCode,
      subjectName: subjectName.trim(),
      subjectType,
      credits: Number(credits),
      maxMarks: Number(maxMarks),
      passingMarks: Number(passingMarks),
    });

    const populatedSubject =
      await Subject.findById(subject._id)
        .populate(
          "courseId",
          "courseCode courseName"
        )
        .populate(
          "branchId",
          "branchCode branchName"
        )
        .populate(
          "semesterId",
          "semesterNumber semesterName"
        );

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject: populatedSubject,
    });
  } catch (error) {
    console.error("CREATE SUBJECT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for the selected semester",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create subject",
    });
  }
};

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate(
        "courseId",
        "courseCode courseName courseType"
      )
      .populate(
        "branchId",
        "branchCode branchName"
      )
      .populate(
        "semesterId",
        "semesterNumber semesterName"
      )
      .sort({
        semesterId: 1,
        subjectCode: 1,
      });

    return res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error(
      "GET ALL SUBJECTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

// Get Subject By ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate(
        "courseId",
        "courseCode courseName courseType"
      )
      .populate(
        "branchId",
        "branchCode branchName"
      )
      .populate(
        "semesterId",
        "semesterNumber semesterName"
      );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      subject,
    });
  } catch (error) {
    console.error(
      "GET SUBJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
    });
  }
};

// Update Subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      courseId,
      branchId,
      semesterId,
      subjectCode,
      subjectName,
      subjectType,
      credits,
      maxMarks,
      passingMarks,
      isActive,
    } = req.body;

    const subject =
      await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    if (
      !courseId ||
      !branchId ||
      !semesterId ||
      !subjectCode ||
      !subjectName ||
      !subjectType ||
      credits === undefined ||
      maxMarks === undefined ||
      passingMarks === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All subject fields are required",
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

    const semester = await Semester.findById(
      semesterId
    );

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    if (
      semester.courseId.toString() !==
      courseId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected semester does not belong to the selected course",
      });
    }

    if (
      semester.branchId.toString() !==
      branchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected semester does not belong to the selected branch",
      });
    }

    if (
      isActive &&
      (!course.isActive ||
        !branch.isActive ||
        !semester.isActive)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot activate subject under an inactive academic structure",
      });
    }

    if (passingMarks > maxMarks) {
      return res.status(400).json({
        success: false,
        message:
          "Passing marks cannot be greater than maximum marks",
      });
    }

    const normalizedCode =
      subjectCode.trim().toUpperCase();

    const duplicateSubject =
      await Subject.findOne({
        _id: { $ne: id },
        semesterId,
        subjectCode: normalizedCode,
      });

    if (duplicateSubject) {
      return res.status(409).json({
        success: false,
        message:
          "Another subject with this code already exists for the selected semester",
      });
    }

    subject.courseId = courseId;
    subject.branchId = branchId;
    subject.semesterId = semesterId;
    subject.subjectCode = normalizedCode;
    subject.subjectName =
      subjectName.trim();
    subject.subjectType = subjectType;
    subject.credits = Number(credits);
    subject.maxMarks = Number(maxMarks);
    subject.passingMarks =
      Number(passingMarks);

    if (typeof isActive === "boolean") {
      subject.isActive = isActive;
    }

    await subject.save();

    const updatedSubject =
      await Subject.findById(id)
        .populate(
          "courseId",
          "courseCode courseName courseType"
        )
        .populate(
          "branchId",
          "branchCode branchName"
        )
        .populate(
          "semesterId",
          "semesterNumber semesterName"
        );

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error(
      "UPDATE SUBJECT ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This subject code already exists for the selected semester",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update subject",
    });
  }
};

// Delete Subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject =
      await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    await Subject.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE SUBJECT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete subject",
    });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};