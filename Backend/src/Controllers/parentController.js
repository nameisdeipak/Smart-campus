const Parent = require("../Models/parent");
const Student = require("../Models/student");
const User = require("../Models/user");

const createParent = async (req, res) => {
  try {
    const {
      studentId,

      fatherName,
      fatherPhone,
      fatherEmail,
      fatherOccupation,

      motherName,
      motherPhone,
      motherEmail,
      motherOccupation,

      guardianName,
      guardianPhone,
      guardianRelation,

      address,
      city,
      state,
      pincode,
    } = req.body;

    if (
      !studentId ||
      !fatherName ||
      !fatherPhone ||
      !motherName ||
      !motherPhone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student, father name, father phone, mother name and mother phone are required",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.userId) {
      const user = await User.findById(student.userId);

      if (user && user.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "Student account is inactive",
        });
      }
    }

    const existingParent = await Parent.findOne({
      studentId,
    });

    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: "Parent details already exist for this student",
      });
    }

    const parent = await Parent.create({
      studentId,

      fatherName,
      fatherPhone,
      fatherEmail,
      fatherOccupation,

      motherName,
      motherPhone,
      motherEmail,
      motherOccupation,

      guardianName,
      guardianPhone,
      guardianRelation,

      address,
      city,
      state,
      pincode,
    });

    const populatedParent = await Parent.findById(parent._id).populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "name email phone isActive",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Parent details created successfully",
      parent: populatedParent,
    });
  } catch (error) {
    console.error("Create Parent Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create parent details",
      error: error.message,
    });
  }
};

const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate({
        path: "studentId",
        populate: {
          path: "userId",
          select: "name email phone isActive",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: parents.length,
      parents,
    });
  } catch (error) {
    console.error("Get All Parents Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parents",
      error: error.message,
    });
  }
};

const getParentById = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findById(id).populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "name email phone isActive",
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent details not found",
      });
    }

    return res.status(200).json({
      success: true,
      parent,
    });
  } catch (error) {
    console.error("Get Parent By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parent details",
      error: error.message,
    });
  }
};

const getParentByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const parent = await Parent.findOne({
      studentId,
    }).populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "name email phone isActive",
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent details not found for this student",
      });
    }

    return res.status(200).json({
      success: true,
      parent,
    });
  } catch (error) {
    console.error("Get Parent By Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student's parent details",
      error: error.message,
    });
  }
};

const updateParent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      studentId,

      fatherName,
      fatherPhone,
      fatherEmail,
      fatherOccupation,

      motherName,
      motherPhone,
      motherEmail,
      motherOccupation,

      guardianName,
      guardianPhone,
      guardianRelation,

      address,
      city,
      state,
      pincode,

      isActive,
    } = req.body;

    const parent = await Parent.findById(id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent details not found",
      });
    }

    if (studentId && String(studentId) !== String(parent.studentId)) {
      const student = await Student.findById(studentId);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const existingParent = await Parent.findOne({
        studentId,
        _id: { $ne: id },
      });

      if (existingParent) {
        return res.status(409).json({
          success: false,
          message:
            "Parent details already exist for the selected student",
        });
      }

      parent.studentId = studentId;
    }

    if (fatherName !== undefined) {
      parent.fatherName = fatherName;
    }

    if (fatherPhone !== undefined) {
      parent.fatherPhone = fatherPhone;
    }

    if (fatherEmail !== undefined) {
      parent.fatherEmail = fatherEmail;
    }

    if (fatherOccupation !== undefined) {
      parent.fatherOccupation = fatherOccupation;
    }

    if (motherName !== undefined) {
      parent.motherName = motherName;
    }

    if (motherPhone !== undefined) {
      parent.motherPhone = motherPhone;
    }

    if (motherEmail !== undefined) {
      parent.motherEmail = motherEmail;
    }

    if (motherOccupation !== undefined) {
      parent.motherOccupation = motherOccupation;
    }

    if (guardianName !== undefined) {
      parent.guardianName = guardianName;
    }

    if (guardianPhone !== undefined) {
      parent.guardianPhone = guardianPhone;
    }

    if (guardianRelation !== undefined) {
      parent.guardianRelation = guardianRelation;
    }

    if (address !== undefined) {
      parent.address = address;
    }

    if (city !== undefined) {
      parent.city = city;
    }

    if (state !== undefined) {
      parent.state = state;
    }

    if (pincode !== undefined) {
      parent.pincode = pincode;
    }

    if (isActive !== undefined) {
      parent.isActive = isActive;
    }

    await parent.save();

    const updatedParent = await Parent.findById(id).populate({
      path: "studentId",
      populate: {
        path: "userId",
        select: "name email phone isActive",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Parent details updated successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error("Update Parent Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update parent details",
      error: error.message,
    });
  }
};

const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findById(id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent details not found",
      });
    }

    await Parent.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Parent details deleted successfully",
    });
  } catch (error) {
    console.error("Delete Parent Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete parent details",
      error: error.message,
    });
  }
};

module.exports = {
  createParent,
  getAllParents,
  getParentById,
  getParentByStudent,
  updateParent,
  deleteParent,
};