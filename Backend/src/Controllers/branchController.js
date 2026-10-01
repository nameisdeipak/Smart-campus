const Branch = require("../Models/branch");
const Course = require("../Models/course");
const Faculty = require("../Models/faculty");

const createBranch = async (req, res) => {
  try {
    const {
      courseId,
      branchCode,
      branchName,
      description,
      hod,
    } = req.body;

    if (
      !courseId ||
      !branchCode ||
      !branchName
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
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
          "Cannot add branch to an inactive course",
      });
    }

    const normalizedCode = branchCode
      .trim()
      .toUpperCase();

    const existingBranch =
      await Branch.findOne({
        courseId,
        branchCode: normalizedCode,
      });

    if (existingBranch) {
      return res.status(409).json({
        success: false,
        message:
          "Branch code already exists for this course",
      });
    }

    if (hod) {
      const faculty = await Faculty.findById(hod);

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Selected HOD not found",
        });
      }
    }

    const branch = await Branch.create({
      courseId,
      branchCode: normalizedCode,
      branchName: branchName.trim(),
      description,
      hod: hod || null,
    });

    const populatedBranch =
      await Branch.findById(branch._id)
        .populate(
          "courseId",
          "courseName courseCode courseType"
        )
        .populate(
          "hod",
          "facultyId employeeId userId department designation"
        );

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      branch: populatedBranch,
    });
  } catch (error) {
    console.error(
      "Create Branch Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Branch code already exists for this course",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create branch",
    });
  }
};

const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate(
        "courseId",
        "courseName courseCode courseType isActive"
      )
      .populate(
        "hod",
        "facultyId employeeId userId department designation"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: branches.length,
      branches,
    });
  } catch (error) {
    console.error(
      "Get Branches Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
    });
  }
};

const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id)
      .populate(
        "courseId",
        "courseName courseCode courseType isActive"
      )
      .populate(
        "hod",
        "facultyId employeeId userId department designation"
      )
      .lean();

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    return res.status(200).json({
      success: true,
      branch,
    });
  } catch (error) {
    console.error(
      "Get Branch By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch",
    });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      courseId,
      branchCode,
      branchName,
      description,
      hod,
      isActive,
    } = req.body;

    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const finalCourseId =
      courseId || branch.courseId;

    const course = await Course.findById(
      finalCourseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      !course.isActive &&
      isActive !== false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot keep branch active under an inactive course",
      });
    }

    const normalizedCode = branchCode
      ? branchCode.trim().toUpperCase()
      : branch.branchCode;

    const duplicateBranch =
      await Branch.findOne({
        courseId: finalCourseId,
        branchCode: normalizedCode,
        _id: { $ne: id },
      });

    if (duplicateBranch) {
      return res.status(409).json({
        success: false,
        message:
          "Branch code already exists for this course",
      });
    }

    if (hod) {
      const faculty = await Faculty.findById(hod);

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Selected HOD not found",
        });
      }
    }

    branch.courseId = finalCourseId;
    branch.branchCode = normalizedCode;
    branch.branchName =
      branchName?.trim() || branch.branchName;
    branch.description =
      description ?? branch.description;
    branch.hod = hod || null;

    if (isActive !== undefined) {
      branch.isActive = isActive;
    }

    await branch.save();

    const updatedBranch =
      await Branch.findById(branch._id)
        .populate(
          "courseId",
          "courseName courseCode courseType isActive"
        )
        .populate(
          "hod",
          "facultyId employeeId userId department designation"
        );

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      branch: updatedBranch,
    });
  } catch (error) {
    console.error(
      "Update Branch Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Branch code already exists for this course",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update branch",
    });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    await Branch.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Branch Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete branch",
    });
  }
};

module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};