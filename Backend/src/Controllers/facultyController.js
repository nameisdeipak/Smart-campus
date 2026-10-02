const bcrypt = require("bcryptjs");

const User = require("../Models/user");
const Faculty = require("../Models/faculty");

const generateFacultyId = async () => {
  const count = await Faculty.countDocuments();

  let number = count + 1;

  let facultyId = `FAC${String(number).padStart(
    4,
    "0"
  )}`;

  while (await Faculty.findOne({ facultyId })) {
    number++;

    facultyId = `FAC${String(number).padStart(
      4,
      "0"
    )}`;
  }

  return facultyId;
};

const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      dateOfBirth,
      gender,
      department,
      designation,
      qualification,
      specialization,
      joiningDate,
      experience,
      employmentType,
      section,
      address,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !department ||
      !designation
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (employeeId) {
      const existingEmployee =
        await Faculty.findOne({
          employeeId,
        });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const facultyId = await generateFacultyId();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "faculty",
      phone,
    });

    try {
      const faculty = await Faculty.create({
        userId: user._id,
        facultyId,
        employeeId,
        dateOfBirth,
        gender,
        department,
        designation,
        qualification,
        specialization,
        joiningDate,
        experience,
        employmentType,
        section,
        address,
      });

      return res.status(201).json({
        success: true,
        message: "Faculty created successfully",
        faculty: {
          id: faculty._id,
          facultyId: faculty.facultyId,
          name: user.name,
          email: user.email,
          department: faculty.department,
          designation: faculty.designation,
        },
      });
    } catch (facultyError) {
      await User.findByIdAndDelete(user._id);
      throw facultyError;
    }
  } catch (error) {
    console.error(
      "Create Faculty Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create faculty",
      error: error.message,
    });
  }
};

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate(
        "userId",
        "name email phone isActive"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: faculty.length,
      faculty,
    });
  } catch (error) {
    console.error(
      "Get Faculty Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
    });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id).populate(
      "userId",
      "name email phone isActive"
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error(
      "Get Faculty By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
    });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      employeeId,
      dateOfBirth,
      gender,
      department,
      designation,
      qualification,
      specialization,
      joiningDate,
      experience,
      employmentType,
      section,
      address,
    } = req.body;

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (
      employeeId &&
      employeeId !== faculty.employeeId
    ) {
      const existingEmployee =
        await Faculty.findOne({
          employeeId,
          _id: { $ne: id },
        });

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists",
        });
      }
    }

    faculty.employeeId =
      employeeId ?? faculty.employeeId;

    faculty.dateOfBirth =
      dateOfBirth ?? faculty.dateOfBirth;

    faculty.gender = gender ?? faculty.gender;

    faculty.department =
      department ?? faculty.department;

    faculty.designation =
      designation ?? faculty.designation;

    faculty.qualification =
      qualification ?? faculty.qualification;

    faculty.specialization =
      specialization ?? faculty.specialization;

    faculty.joiningDate =
      joiningDate ?? faculty.joiningDate;

    faculty.experience =
      experience ?? faculty.experience;

    faculty.employmentType =
      employmentType ?? faculty.employmentType;

    faculty.section =
      section ?? faculty.section;

    faculty.address =
      address ?? faculty.address;

    await faculty.save();

    const user = await User.findById(
      faculty.userId
    );

    if (user) {
      user.name = name ?? user.name;
      user.phone = phone ?? user.phone;

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
    });
  } catch (error) {
    console.error(
      "Update Faculty Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update faculty",
    });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    await Faculty.findByIdAndDelete(id);

    await User.findByIdAndDelete(
      faculty.userId
    );

    return res.status(200).json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Faculty Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete faculty",
    });
  }
};

module.exports = {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};