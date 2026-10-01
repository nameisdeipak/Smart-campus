const StudentFee = require("../Models/studentFee");
const Student = require("../Models/student");
const FeeStructure = require("../Models/feeStructure");

const calculateFeeStatus = (paidAmount, payableAmount, dueDate) => {
  if (paidAmount >= payableAmount) {
    return "Paid";
  }

  const currentDate = new Date();
  const paymentDueDate = new Date(dueDate);

  if (paymentDueDate < currentDate && paidAmount < payableAmount) {
    return "Overdue";
  }

  if (paidAmount > 0) {
    return "Partial";
  }

  return "Pending";
};

const createStudentFee = async (req, res) => {
  try {
    const {
      studentId,
      feeStructureId,
      discount = 0,
      dueDate,
      remarks = "",
    } = req.body;

    if (!studentId || !feeStructureId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Student, fee structure and due date are required",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Student is inactive",
      });
    }

    const feeStructure = await FeeStructure.findById(feeStructureId);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    if (feeStructure.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Fee structure is inactive",
      });
    }

    if (
      student.course &&
      student.course.toString() !== feeStructure.courseId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Fee structure does not belong to student's course",
      });
    }

    if (
      student.branch &&
      student.branch.toString() !== feeStructure.branchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Fee structure does not belong to student's branch",
      });
    }

    const existingStudentFee = await StudentFee.findOne({
      studentId,
      feeStructureId,
    });

    if (existingStudentFee) {
      return res.status(409).json({
        success: false,
        message: "Fee already assigned to this student",
      });
    }

    const totalAmount = Number(feeStructure.totalAmount);
    const discountAmount = Number(discount);

    if (Number.isNaN(discountAmount) || discountAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount amount",
      });
    }

    if (discountAmount > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot be greater than total amount",
      });
    }

    const payableAmount = totalAmount - discountAmount;
    const paidAmount = 0;
    const dueAmount = payableAmount;

    const status = calculateFeeStatus(
      paidAmount,
      payableAmount,
      dueDate
    );

    const studentFee = await StudentFee.create({
      studentId,
      feeStructureId,
      academicYear: feeStructure.academicYear,
      totalAmount,
      discount: discountAmount,
      payableAmount,
      paidAmount,
      dueAmount,
      dueDate,
      status,
      remarks: remarks.trim(),
    });

    const populatedStudentFee = await StudentFee.findById(
      studentFee._id
    )
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "feeStructureId",
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
      });

    return res.status(201).json({
      success: true,
      message: "Student fee created successfully",
      data: populatedStudentFee,
    });
  } catch (error) {
    console.error("Create Student Fee Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Fee already assigned to this student",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create student fee",
      error: error.message,
    });
  }
};

const getAllStudentFees = async (req, res) => {
  try {
    const studentFees = await StudentFee.find()
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "feeStructureId",
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
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: studentFees.length,
      data: studentFees,
    });
  } catch (error) {
    console.error("Get Student Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const studentFees = await StudentFee.find({
      studentId,
    })
      .populate({
        path: "feeStructureId",
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
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: studentFees.length,
      data: studentFees,
    });
  } catch (error) {
    console.error("Get Student Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student fees",
      error: error.message,
    });
  }
};

const getStudentFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const studentFee = await StudentFee.findById(id)
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "feeStructureId",
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
      });

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: studentFee,
    });
  } catch (error) {
    console.error("Get Student Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student fee",
      error: error.message,
    });
  }
};

const updateStudentFee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      discount,
      dueDate,
      remarks,
      isActive,
    } = req.body;

    const studentFee = await StudentFee.findById(id);

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    if (discount !== undefined) {
      const discountAmount = Number(discount);

      if (
        Number.isNaN(discountAmount) ||
        discountAmount < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount amount",
        });
      }

      if (discountAmount > studentFee.totalAmount) {
        return res.status(400).json({
          success: false,
          message: "Discount cannot be greater than total amount",
        });
      }

      studentFee.discount = discountAmount;
      studentFee.payableAmount =
        studentFee.totalAmount - discountAmount;

      if (studentFee.paidAmount > studentFee.payableAmount) {
        return res.status(400).json({
          success: false,
          message:
            "Discount cannot make payable amount less than paid amount",
        });
      }

      studentFee.dueAmount =
        studentFee.payableAmount - studentFee.paidAmount;
    }

    if (dueDate !== undefined) {
      studentFee.dueDate = dueDate;
    }

    if (remarks !== undefined) {
      studentFee.remarks = remarks.trim();
    }

    if (isActive !== undefined) {
      studentFee.isActive = isActive;
    }

    studentFee.status = calculateFeeStatus(
      studentFee.paidAmount,
      studentFee.payableAmount,
      studentFee.dueDate
    );

    await studentFee.save();

    const updatedStudentFee = await StudentFee.findById(id)
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "feeStructureId",
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
      });

    return res.status(200).json({
      success: true,
      message: "Student fee updated successfully",
      data: updatedStudentFee,
    });
  } catch (error) {
    console.error("Update Student Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student fee",
      error: error.message,
    });
  }
};

const deleteStudentFee = async (req, res) => {
  try {
    const { id } = req.params;

    const studentFee = await StudentFee.findById(id);

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    if (studentFee.paidAmount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Student fee cannot be deleted because payment already exists",
      });
    }

    await StudentFee.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Student fee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Student Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student fee",
      error: error.message,
    });
  }
};

module.exports = {
  createStudentFee,
  getAllStudentFees,
  getStudentFees,
  getStudentFeeById,
  updateStudentFee,
  deleteStudentFee,
};