const Student = require("../Models/student");
const Faculty = require("../Models/faculty");
const Course = require("../Models/course");
const Branch = require("../Models/branch");
const Semester = require("../Models/semester");
const Subject = require("../Models/subject");
const Parent = require("../Models/parent");
const StudentSubject = require("../Models/studentSubject");
const FeeStructure = require("../Models/feeStructure");
const StudentFee = require("../Models/studentFee");
const FeePayment = require("../Models/feePayment");
const HelpDesk = require("../Models/helpDesk");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalBranches,
      totalSemesters,
      totalSubjects,
      totalParents,
      totalEnrollments,
      totalFeeStructures,
      totalStudentFees,
      totalPayments,
      openHelpdeskTickets,
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Course.countDocuments(),
      Branch.countDocuments(),
      Semester.countDocuments(),
      Subject.countDocuments(),
      Parent.countDocuments(),
      StudentSubject.countDocuments(),
      FeeStructure.countDocuments(),
      StudentFee.countDocuments(),
      FeePayment.countDocuments(),
      HelpDesk.countDocuments({
        status: {
          $in: ["Open", "In Progress"],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalBranches,
        totalSemesters,
        totalSubjects,
        totalParents,
        totalEnrollments,
        totalFeeStructures,
        totalStudentFees,
        totalPayments,
        openHelpdeskTickets,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = {
  getDashboardStats,
};