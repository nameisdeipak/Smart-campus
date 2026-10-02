const Course = require("../Models/course");

const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      courseType,
      duration,
      durationUnit,
      description,
    } = req.body;

    if (
      !courseCode ||
      !courseName ||
      !courseType ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const normalizedCode = courseCode
      .trim()
      .toUpperCase();

    const existingCourse = await Course.findOne({
      courseCode: normalizedCode,
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course code already exists",
      });
    }

    const course = await Course.create({
      courseCode: normalizedCode,
      courseName: courseName.trim(),
      courseType,
      duration,
      durationUnit,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error(
      "Get Course By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      courseCode,
      courseName,
      courseType,
      duration,
      durationUnit,
      description,
      isActive,
    } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (
      courseCode &&
      courseCode.toUpperCase() !==
        course.courseCode
    ) {
      const existingCourse =
        await Course.findOne({
          courseCode: courseCode
            .trim()
            .toUpperCase(),
          _id: { $ne: id },
        });

      if (existingCourse) {
        return res.status(409).json({
          success: false,
          message: "Course code already exists",
        });
      }

      course.courseCode = courseCode
        .trim()
        .toUpperCase();
    }

    if (courseName !== undefined) {
      course.courseName = courseName.trim();
    }

    if (courseType !== undefined) {
      course.courseType = courseType;
    }

    if (duration !== undefined) {
      course.duration = duration;
    }

    if (durationUnit !== undefined) {
      course.durationUnit = durationUnit;
    }

    if (description !== undefined) {
      course.description = description;
    }

    if (isActive !== undefined) {
      course.isActive = isActive;
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Update Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};