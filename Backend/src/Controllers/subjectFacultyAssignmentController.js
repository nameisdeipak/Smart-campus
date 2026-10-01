const SubjectFacultyAssignment = require("../Models/subjectFacultyAssignment");
const Subject = require("../Models/subject");
const Faculty = require("../Models/faculty");

const createAssignment = async (req, res) => {
  try {
    const {
      subjectId,
      facultyId,
      section,
      academicYear,
    } = req.body;

    if (
      !subjectId ||
      !facultyId ||
      !section ||
      !academicYear
    ) {
      return res.status(400).json({
        message:
          "Subject, faculty, section and academic year are required",
      });
    }

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    if (subject.isActive === false) {
      return res.status(400).json({
        message: "Cannot assign faculty to inactive subject",
      });
    }

    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    if (faculty.userId) {
      const userModel = Faculty.db.model("User");

      const user = await userModel.findById(faculty.userId);

      if (user && user.isActive === false) {
        return res.status(400).json({
          message: "Cannot assign inactive faculty",
        });
      }
    }

    const existingAssignment =
      await SubjectFacultyAssignment.findOne({
        subjectId,
        facultyId,
        section: section.toUpperCase(),
        academicYear: academicYear.trim(),
      });

    if (existingAssignment) {
      return res.status(409).json({
        message:
          "This faculty is already assigned to this subject, section and academic year",
      });
    }

    const assignment =
      await SubjectFacultyAssignment.create({
        subjectId,
        facultyId,
        section: section.toUpperCase(),
        academicYear: academicYear.trim(),
      });

    const populatedAssignment =
      await SubjectFacultyAssignment.findById(
        assignment._id,
      )
        .populate({
          path: "subjectId",
          select:
            "subjectCode subjectName subjectType credits maxMarks passingMarks",
        })
        .populate({
          path: "facultyId",
          populate: {
            path: "userId",
            select: "name email phone isActive",
          },
        });

    return res.status(201).json({
      message: "Faculty assigned successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This faculty assignment already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to assign faculty",
    });
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const assignments =
      await SubjectFacultyAssignment.find()
        .populate({
          path: "subjectId",
          select:
            "subjectCode subjectName subjectType courseId branchId semesterId",
        })
        .populate({
          path: "facultyId",
          populate: {
            path: "userId",
            select: "name email phone isActive",
          },
        })
        .sort({ createdAt: -1 });

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error("Get Assignments Error:", error);

    return res.status(500).json({
      message: "Failed to fetch faculty assignments",
    });
  }
};

const getAssignmentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const assignments =
      await SubjectFacultyAssignment.find({
        subjectId,
      })
        .populate({
          path: "facultyId",
          populate: {
            path: "userId",
            select: "name email phone isActive",
          },
        })
        .sort({
          section: 1,
          createdAt: -1,
        });

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error(
      "Get Subject Assignments Error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to fetch subject faculty assignments",
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      facultyId,
      section,
      academicYear,
      assignmentStatus,
    } = req.body;

    const assignment =
      await SubjectFacultyAssignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    if (facultyId) {
      const faculty =
        await Faculty.findById(facultyId);

      if (!faculty) {
        return res.status(404).json({
          message: "Faculty not found",
        });
      }

      assignment.facultyId = facultyId;
    }

    if (section) {
      assignment.section =
        section.toUpperCase();
    }

    if (academicYear) {
      assignment.academicYear =
        academicYear.trim();
    }

    if (assignmentStatus) {
      assignment.assignmentStatus =
        assignmentStatus;
    }

    await assignment.save();

    const updatedAssignment =
      await SubjectFacultyAssignment.findById(
        assignment._id,
      )
        .populate({
          path: "subjectId",
          select:
            "subjectCode subjectName subjectType",
        })
        .populate({
          path: "facultyId",
          populate: {
            path: "userId",
            select: "name email phone isActive",
          },
        });

    return res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error(
      "Update Assignment Error:",
      error,
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This faculty assignment already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update assignment",
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment =
      await SubjectFacultyAssignment.findByIdAndDelete(
        id,
      );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      message: "Faculty assignment removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete Assignment Error:",
      error,
    );

    return res.status(500).json({
      message: "Failed to remove assignment",
    });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentsBySubject,
  updateAssignment,
  deleteAssignment,
};