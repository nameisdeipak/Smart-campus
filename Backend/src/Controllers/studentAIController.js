const Attendance = require("../Models/attandance");
const Marks = require("../Models/marks");
const Student = require("../Models/student");
const StudentFee = require("../Models/studentFee");
const StudentSubject = require("../Models/studentSubject");
const TimeTable = require("../Models/timeTable");
const { generateGeminiResponse } = require("../Services/geminiAIService");

const MAX_HISTORY_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 3000;

const getStudentContext = async (userId) => {
  const student = await Student.findOne({ userId })
    .populate("userId", "name")
    .lean();

  if (!student) {
    const error = new Error("Student profile not found");
    error.statusCode = 404;
    throw error;
  }

  const [attendance, marks, fees, subjects, timetable] = await Promise.all([
    Attendance.find({ studentId: student._id }).sort({ date: -1 }).lean(),
    Marks.find({ studentId: student._id }).sort({ semester: -1 }).lean(),
    StudentFee.find({ studentId: student._id, isActive: true })
      .populate("feeStructureId", "academicYear feeItems totalAmount")
      .sort({ dueDate: 1 })
      .lean(),
    StudentSubject.find({
      studentId: student._id,
      enrollmentStatus: "Enrolled",
    })
      .populate("subjectId", "subjectCode subjectName subjectType credits")
      .lean(),
    TimeTable.find({
      section: student.section,
      academicYear: process.env.ACADEMIC_YEAR || "2026-27",
    })
      .populate("subjectId", "subjectCode subjectName")
      .sort({ dayOrder: 1, startTime: 1 })
      .lean(),
  ]);

  const present = attendance.filter((record) => record.status === "present").length;
  const late = attendance.filter((record) => record.status === "late").length;
  const attendancePercentage = attendance.length
    ? Number((((present + late * 0.5) / attendance.length) * 100).toFixed(1))
    : 0;

  return JSON.stringify({
    studentName: student.userId?.name || "Student",
    enrollmentNumber: student.enrollmentNumber,
    semester: student.semester,
    section: student.section,
    admissionYear: student.admissionYear,
    attendance: {
      percentage: attendancePercentage,
      totalClasses: attendance.length,
      present,
      absent: attendance.filter((record) => record.status === "absent").length,
      late,
    },
    performance: marks.map((record) => ({
      subject: record.subject,
      semester: record.semester,
      internalMarks: record.internalMarks,
      assignmentScore: record.assignmentScore,
      previousMarks: record.previousMarks,
    })),
    fees: fees.map((fee) => ({
      academicYear: fee.academicYear,
      feeItems: fee.feeStructureId?.feeItems?.map((item) => item.feeType) || [],
      payableAmount: fee.payableAmount,
      paidAmount: fee.paidAmount,
      dueAmount: fee.dueAmount,
      dueDate: fee.dueDate,
      status: fee.status,
    })),
    enrolledSubjects: subjects
      .map((item) => item.subjectId?.subjectName)
      .filter(Boolean),
    timetable: timetable.map((entry) => ({
      subject: entry.subjectId?.subjectName || "Subject",
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room,
    })),
  });
};

const chatWithStudentAI = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Student access required",
      });
    }

    const { messages } = req.body;
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > MAX_HISTORY_MESSAGES ||
      messages[messages.length - 1]?.role !== "user"
    ) {
      return res.status(400).json({
        success: false,
        message: "Send a recent chat history ending with your question",
      });
    }

    const validMessages = messages.every(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        message.content.length <= MAX_MESSAGE_LENGTH
    );

    if (!validMessages) {
      return res.status(400).json({
        success: false,
        message: `Each message must be text with at most ${MAX_MESSAGE_LENGTH} characters`,
      });
    }

    const studentContext = await getStudentContext(req.user._id);
    const answer = await generateGeminiResponse(
      messages.map((message) => ({
        role: message.role,
        content: message.content.trim(),
      })),
      studentContext
    );

    return res.json({ success: true, answer });
  } catch (error) {
    console.error("Student AI Chat Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "AI Assistant could not answer right now",
    });
  }
};

module.exports = { chatWithStudentAI };
