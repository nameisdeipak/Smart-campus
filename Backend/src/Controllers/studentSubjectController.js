const StudentSubject = require("../Models/studentSubject");
const Student = require("../Models/student");
const Subject = require("../Models/subject");

const createStudentSubject = async (req, res) => {
  try {
    const { studentId, subjectId } = req.body;

    if (!studentId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Subject ID are required",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    if (student.userId) {
      const User = require("../Models/user");

      const user = await User.findById(student.userId);

      if (user && user.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "Student account is inactive",
        });
      }
    }

    if (subject.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Subject is inactive",
      });
    }

    if (
      String(student.course) !== String(subject.courseId) ||
      String(student.branch) !== String(subject.branchId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student and subject do not belong to the same course and branch",
      });
    }

    const existingRelation = await StudentSubject.findOne({
      studentId,
      subjectId,
    });

    if (existingRelation) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this subject",
      });
    }

    const studentSubject = await StudentSubject.create({
      studentId,
      subjectId,
    });

    const populatedStudentSubject =
      await StudentSubject.findById(studentSubject._id)
        .populate({
          path: "studentId",
          populate: {
            path: "userId",
            select: "name email phone isActive",
          },
        })
        .populate({
          path: "subjectId",
          select:
            "subjectCode subjectName subjectType credits maxMarks passingMarks courseId branchId semesterId",
        });

    return res.status(201).json({
      success: true,
      message: "Student enrolled in subject successfully",
      studentSubject: populatedStudentSubject,
    });
  } catch (error) {
    console.error("Create Student Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to enroll student in subject",
      error: error.message,
    });
  }
};

const getAllStudentSubjects = async (req, res) => {
  try {
    const studentSubjects = await StudentSubject.find()
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email phone isActive",
        },
      })
      .populate({
        path: "subjectId",
        select:
          "subjectCode subjectName subjectType credits maxMarks passingMarks courseId branchId semesterId",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: studentSubjects.length,
      studentSubjects,
    });
  } catch (error) {
    console.error("Get All Student Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student subjects",
      error: error.message,
    });
  }
};

const getStudentSubjects = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentSubjects = await StudentSubject.find({
      studentId,
    })
      .populate({
        path: "subjectId",
        select:
          "subjectCode subjectName subjectType credits maxMarks passingMarks courseId branchId semesterId",
        populate: [
          {
            path: "courseId",
            select: "courseCode courseName",
          },
          {
            path: "branchId",
            select: "branchCode branchName",
          },
          {
            path: "semesterId",
            select: "semesterNumber semesterName",
          },
        ],
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: studentSubjects.length,
      studentSubjects,
    });
  } catch (error) {
    console.error("Get Student Subjects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student's subjects",
      error: error.message,
    });
  }
};

const getSubjectStudents = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const studentSubjects = await StudentSubject.find({
      subjectId,
      enrollmentStatus: "Enrolled",
    })
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email phone isActive",
        },
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: studentSubjects.length,
      studentSubjects,
    });
  } catch (error) {
    console.error("Get Subject Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject students",
      error: error.message,
    });
  }
};

const updateStudentSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { enrollmentStatus } = req.body;

    if (!enrollmentStatus) {
      return res.status(400).json({
        success: false,
        message: "Enrollment status is required",
      });
    }

    const allowedStatuses = [
      "Enrolled",
      "Dropped",
      "Completed",
    ];

    if (!allowedStatuses.includes(enrollmentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment status",
      });
    }

    const studentSubject =
      await StudentSubject.findById(id);

    if (!studentSubject) {
      return res.status(404).json({
        success: false,
        message: "Student subject relation not found",
      });
    }

    studentSubject.enrollmentStatus = enrollmentStatus;

    await studentSubject.save();

    const updatedStudentSubject =
      await StudentSubject.findById(id)
        .populate({
          path: "studentId",
          populate: {
            path: "userId",
            select: "name email phone isActive",
          },
        })
        .populate({
          path: "subjectId",
          select:
            "subjectCode subjectName subjectType credits maxMarks passingMarks",
        });

    return res.status(200).json({
      success: true,
      message: "Student subject status updated successfully",
      studentSubject: updatedStudentSubject,
    });
  } catch (error) {
    console.error("Update Student Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student subject",
      error: error.message,
    });
  }
};

const deleteStudentSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const studentSubject =
      await StudentSubject.findById(id);

    if (!studentSubject) {
      return res.status(404).json({
        success: false,
        message: "Student subject relation not found",
      });
    }

    await StudentSubject.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Student subject relation deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Subject Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student subject relation",
      error: error.message,
    });
  }
};

module.exports = {
  createStudentSubject,
  getAllStudentSubjects,
  getStudentSubjects,
  getSubjectStudents,
  updateStudentSubject,
  deleteStudentSubject,
};