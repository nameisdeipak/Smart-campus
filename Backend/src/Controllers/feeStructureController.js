const FeeStructure = require("../Models/feeStructure");
const Course = require("../Models/course");
const Branch = require("../Models/branch");
const Semester = require("../Models/semester");

const calculateTotal = (feeItems) => {
  return feeItems.reduce((total, item) => {
    return total + Number(item.amount);
  }, 0);
};

const createFeeStructure = async (req, res) => {
  try {
    const {
      courseId,
      branchId,
      semesterId,
      academicYear,
      feeItems,
    } = req.body;

    if (
      !courseId ||
      !branchId ||
      !semesterId ||
      !academicYear ||
      !Array.isArray(feeItems) ||
      feeItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
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

    if (branch.courseId.toString() !== courseId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Branch does not belong to selected course",
      });
    }

    const semester = await Semester.findById(semesterId);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    if (semester.branchId.toString() !== branchId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Semester does not belong to selected branch",
      });
    }

    const existingFeeStructure = await FeeStructure.findOne({
      courseId,
      branchId,
      semesterId,
      academicYear: academicYear.trim(),
    });

    if (existingFeeStructure) {
      return res.status(409).json({
        success: false,
        message: "Fee structure already exists for this academic year",
      });
    }

    const formattedFeeItems = feeItems.map((item) => ({
      feeType: item.feeType?.trim(),
      amount: Number(item.amount),
    }));

    const invalidFeeItem = formattedFeeItems.find(
      (item) =>
        !item.feeType ||
        Number.isNaN(item.amount) ||
        item.amount < 0
    );

    if (invalidFeeItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee item",
      });
    }

    const totalAmount = calculateTotal(formattedFeeItems);

    const feeStructure = await FeeStructure.create({
      courseId,
      branchId,
      semesterId,
      academicYear: academicYear.trim(),
      feeItems: formattedFeeItems,
      totalAmount,
    });

    const populatedFeeStructure = await FeeStructure.findById(
      feeStructure._id
    )
      .populate("courseId", "courseCode courseName")
      .populate("branchId", "branchCode branchName")
      .populate("semesterId", "semesterNumber semesterName");

    return res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: populatedFeeStructure,
    });
  } catch (error) {
    console.error("Create Fee Structure Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Fee structure already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create fee structure",
      error: error.message,
    });
  }
};

const getAllFeeStructures = async (req, res) => {
  try {
    const feeStructures = await FeeStructure.find()
      .populate("courseId", "courseCode courseName")
      .populate("branchId", "branchCode branchName")
      .populate("semesterId", "semesterNumber semesterName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });
  } catch (error) {
    console.error("Get Fee Structures Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee structures",
      error: error.message,
    });
  }
};

const getFeeStructureById = async (req, res) => {
  try {
    const { id } = req.params;

    const feeStructure = await FeeStructure.findById(id)
      .populate("courseId", "courseCode courseName")
      .populate("branchId", "branchCode branchName")
      .populate("semesterId", "semesterNumber semesterName");

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: feeStructure,
    });
  } catch (error) {
    console.error("Get Fee Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee structure",
      error: error.message,
    });
  }
};

const updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      courseId,
      branchId,
      semesterId,
      academicYear,
      feeItems,
      isActive,
    } = req.body;

    const feeStructure = await FeeStructure.findById(id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    const finalCourseId = courseId || feeStructure.courseId;
    const finalBranchId = branchId || feeStructure.branchId;
    const finalSemesterId = semesterId || feeStructure.semesterId;
    const finalAcademicYear =
      academicYear?.trim() || feeStructure.academicYear;

    const course = await Course.findById(finalCourseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const branch = await Branch.findById(finalBranchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    if (
      branch.courseId.toString() !== finalCourseId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Branch does not belong to selected course",
      });
    }

    const semester = await Semester.findById(finalSemesterId);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    if (
      semester.branchId.toString() !== finalBranchId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Semester does not belong to selected branch",
      });
    }

    const duplicate = await FeeStructure.findOne({
      _id: { $ne: id },
      courseId: finalCourseId,
      branchId: finalBranchId,
      semesterId: finalSemesterId,
      academicYear: finalAcademicYear,
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another fee structure already exists for this combination",
      });
    }

    if (feeItems !== undefined) {
      if (!Array.isArray(feeItems) || feeItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one fee item is required",
        });
      }

      const formattedFeeItems = feeItems.map((item) => ({
        feeType: item.feeType?.trim(),
        amount: Number(item.amount),
      }));

      const invalidFeeItem = formattedFeeItems.find(
        (item) =>
          !item.feeType ||
          Number.isNaN(item.amount) ||
          item.amount < 0
      );

      if (invalidFeeItem) {
        return res.status(400).json({
          success: false,
          message: "Invalid fee item",
        });
      }

      feeStructure.feeItems = formattedFeeItems;
      feeStructure.totalAmount = calculateTotal(formattedFeeItems);
    }

    feeStructure.courseId = finalCourseId;
    feeStructure.branchId = finalBranchId;
    feeStructure.semesterId = finalSemesterId;
    feeStructure.academicYear = finalAcademicYear;

    if (isActive !== undefined) {
      feeStructure.isActive = isActive;
    }

    await feeStructure.save();

    const updatedFeeStructure = await FeeStructure.findById(id)
      .populate("courseId", "courseCode courseName")
      .populate("branchId", "branchCode branchName")
      .populate("semesterId", "semesterNumber semesterName");

    return res.status(200).json({
      success: true,
      message: "Fee structure updated successfully",
      data: updatedFeeStructure,
    });
  } catch (error) {
    console.error("Update Fee Structure Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Fee structure already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update fee structure",
      error: error.message,
    });
  }
};

const deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;

    const feeStructure = await FeeStructure.findById(id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    await FeeStructure.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Fee structure deleted successfully",
    });
  } catch (error) {
    console.error("Delete Fee Structure Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete fee structure",
      error: error.message,
    });
  }
};

module.exports = {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
};