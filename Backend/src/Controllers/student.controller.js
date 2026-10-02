import Student from "../models/student.model.js";

const getMyStudent = async (req, res) => {
  try {
    const { userId } = req.auth();
    console.log(userId)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const student = await Student.findOne({ clerkId: userId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

export { getMyStudent };
