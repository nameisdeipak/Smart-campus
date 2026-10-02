const FeePayment = require("../Models/feePayment");
const StudentFee = require("../Models/studentFee");
const Student = require("../Models/student");

const calculateStatus = (paidAmount, payableAmount, dueDate) => {
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

const generateReceiptNumber = async () => {
  const prefix = "UC-FEE";
  const timestamp = Date.now();

  return `${prefix}-${timestamp}`;
};

const createFeePayment = async (req, res) => {
  try {
    const {
      studentFeeId,
      amount,
      paymentMethod,
      transactionId = "",
      paymentDate,
      receiptNumber,
      remarks = "",
    } = req.body;

    if (!studentFeeId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "Student fee, amount and payment method are required",
      });
    }

    const paymentAmount = Number(amount);

    if (
      Number.isNaN(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    const studentFee = await StudentFee.findById(studentFeeId);

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    if (studentFee.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Student fee is inactive",
      });
    }

    const remainingAmount =
      studentFee.payableAmount - studentFee.paidAmount;

    if (remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "This fee has already been fully paid",
      });
    }

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot be greater than remaining due amount of ${remainingAmount}`,
      });
    }

    const student = await Student.findById(studentFee.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    let finalReceiptNumber = receiptNumber?.trim();

    if (!finalReceiptNumber) {
      finalReceiptNumber = await generateReceiptNumber();
    }

    const existingReceipt = await FeePayment.findOne({
      receiptNumber: finalReceiptNumber,
    });

    if (existingReceipt) {
      return res.status(409).json({
        success: false,
        message: "Receipt number already exists",
      });
    }

    const newPaidAmount =
      studentFee.paidAmount + paymentAmount;

    const newDueAmount =
      studentFee.payableAmount - newPaidAmount;

    const finalPaymentDate = paymentDate
      ? new Date(paymentDate)
      : new Date();

    if (Number.isNaN(finalPaymentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date",
      });
    }

    const payment = await FeePayment.create({
      studentFeeId: studentFee._id,
      studentId: studentFee.studentId,
      amount: paymentAmount,
      paymentMethod,
      transactionId: transactionId.trim(),
      paymentDate: finalPaymentDate,
      receiptNumber: finalReceiptNumber,
      status: "Success",
      remarks: remarks.trim(),
    });

    studentFee.paidAmount = newPaidAmount;
    studentFee.dueAmount = newDueAmount;

    studentFee.status = calculateStatus(
      newPaidAmount,
      studentFee.payableAmount,
      studentFee.dueDate
    );

    await studentFee.save();

    const populatedPayment = await FeePayment.findById(
      payment._id
    )
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "studentFeeId",
        populate: {
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
        },
      });

    return res.status(201).json({
      success: true,
      message: "Fee payment recorded successfully",
      data: populatedPayment,
    });
  } catch (error) {
    console.error("Create Fee Payment Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Receipt number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create fee payment",
      error: error.message,
    });
  }
};

const getAllFeePayments = async (req, res) => {
  try {
    const payments = await FeePayment.find()
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "studentFeeId",
        populate: {
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
        },
      })
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Get Fee Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee payments",
      error: error.message,
    });
  }
};

const getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const payments = await FeePayment.find({
      studentId,
    })
      .populate({
        path: "studentFeeId",
        populate: {
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
        },
      })
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Get Student Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student payments",
      error: error.message,
    });
  }
};

const getPaymentsByStudentFee = async (req, res) => {
  try {
    const { studentFeeId } = req.params;

    const studentFee = await StudentFee.findById(studentFeeId);

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Student fee not found",
      });
    }

    const payments = await FeePayment.find({
      studentFeeId,
    })
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Get Fee Payment History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

const getFeePaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await FeePayment.findById(id)
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate({
        path: "studentFeeId",
        populate: {
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
        },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Fee payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get Fee Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee payment",
      error: error.message,
    });
  }
};

const updateFeePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      paymentMethod,
      transactionId,
      paymentDate,
      remarks,
    } = req.body;

    const payment = await FeePayment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Fee payment not found",
      });
    }

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    if (transactionId !== undefined) {
      payment.transactionId = transactionId.trim();
    }

    if (paymentDate !== undefined) {
      const updatedPaymentDate = new Date(paymentDate);

      if (Number.isNaN(updatedPaymentDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment date",
        });
      }

      payment.paymentDate = updatedPaymentDate;
    }

    if (remarks !== undefined) {
      payment.remarks = remarks.trim();
    }

    await payment.save();

    const updatedPayment = await FeePayment.findById(id)
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("studentFeeId");

    return res.status(200).json({
      success: true,
      message: "Fee payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Update Fee Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update fee payment",
      error: error.message,
    });
  }
};

const deleteFeePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await FeePayment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Fee payment not found",
      });
    }

    if (payment.status === "Refunded") {
      return res.status(400).json({
        success: false,
        message: "Refunded payment cannot be deleted",
      });
    }

    const studentFee = await StudentFee.findById(
      payment.studentFeeId
    );

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Associated student fee not found",
      });
    }

    const newPaidAmount =
      studentFee.paidAmount - payment.amount;

    if (newPaidAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment state",
      });
    }

    const newDueAmount =
      studentFee.payableAmount - newPaidAmount;

    studentFee.paidAmount = newPaidAmount;
    studentFee.dueAmount = newDueAmount;

    studentFee.status = calculateStatus(
      newPaidAmount,
      studentFee.payableAmount,
      studentFee.dueDate
    );

    await studentFee.save();

    await FeePayment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Fee payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Fee Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete fee payment",
      error: error.message,
    });
  }
};

module.exports = {
  createFeePayment,
  getAllFeePayments,
  getPaymentsByStudent,
  getPaymentsByStudentFee,
  getFeePaymentById,
  updateFeePayment,
  deleteFeePayment,
};