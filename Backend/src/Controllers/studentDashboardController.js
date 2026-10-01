const axios = require("axios");

const Student = require("../Models/student");
const Attendance = require("../Models/attandance");
const Marks = require("../Models/marks");
const StudentSubject = require("../Models/studentSubject");
const StudentFee = require("../Models/studentFee");
const FeePayment = require("../Models/feePayment");
const Certificate = require("../Models/certification");
const HelpDesk = require("../Models/helpDesk");
const TimeTable = require("../Models/timeTable");

const getStudentFromUser = async (userId) => {
  const student = await Student.findOne({ userId })
    .populate("userId", "name email phone isActive")
    .lean();

  if (!student) {
    const error = new Error("Student profile not found");
    error.statusCode = 404;
    throw error;
  }

  return student;
};

const calculateAttendance = (records) => {
  if (!records.length) return 0;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  return Number((((present + late * 0.5) / records.length) * 100).toFixed(2));
};

const buildPerformance = (records) => {
  const bySubject = new Map();

  for (const record of records) {
    if (!bySubject.has(record.subject)) bySubject.set(record.subject, []);
    bySubject.get(record.subject).push(record);
  }

  return [...bySubject.entries()].map(([subject, items]) => {
    const average = (field) =>
      Number((items.reduce((sum, item) => sum + Number(item[field] || 0), 0) / items.length).toFixed(2));

    const internalMarks = average("internalMarks");
    const assignmentScore = average("assignmentScore");
    const previousMarks = average("previousMarks");
    const predictedMarks = Number(
      (internalMarks * 0.4 + assignmentScore * 0.2 + previousMarks * 0.4).toFixed(2)
    );

    return {
      subject,
      internalMarks,
      assignmentScore,
      previousMarks,
      predictedMarks,
    };
  });
};

const getRisk = (attendance, averageMarks) => {
  if (attendance < 60 || averageMarks < 45) return "HIGH";
  if (attendance < 75 || averageMarks < 60) return "MEDIUM";
  return "LOW";
};

const getRecommendations = (attendance, averageMarks) => {
  const recommendations = [];
  if (attendance < 75) recommendations.push("Improve attendance and avoid unnecessary absences.");
  if (averageMarks < 60) recommendations.push("Spend focused study time on subjects with lower internal marks.");
  if (averageMarks >= 75) recommendations.push("Maintain your current study routine and revise consistently.");
  recommendations.push("Review assignments before deadlines and use the AI Assistant for academic guidance.");
  return recommendations;
};

const getStudentBundle = async (student) => {
  const studentId = student._id;

  const [attendanceRecords, marksRecords, subjects, fees, payments, certificates, tickets, timetable] = await Promise.all([
    Attendance.find({ studentId }).sort({ date: -1 }).lean(),
    Marks.find({ studentId }).sort({ semester: -1, subject: 1 }).lean(),
    StudentSubject.find({ studentId, enrollmentStatus: "Enrolled" }).populate("subjectId", "code name type credits").lean(),
    StudentFee.find({ studentId, isActive: true }).populate("feeStructureId", "name category academicYear").sort({ dueDate: 1 }).lean(),
    FeePayment.find({ studentId }).sort({ paymentDate: -1 }).lean(),
    Certificate.find({ studentId }).sort({ createdAt: -1 }).lean(),
    HelpDesk.find({ studentId, isActive: true }).sort({ createdAt: -1 }).lean(),
    TimeTable.find({ section: student.section, academicYear: process.env.ACADEMIC_YEAR || "2026-27" })
      .populate("subjectId", "code name")
      .populate("facultyId", "userId")
      .sort({ dayOrder: 1, startTime: 1 })
      .lean(),
  ]);

  const performance = buildPerformance(marksRecords);
  const attendance = calculateAttendance(attendanceRecords);
  const averageMarks = performance.length
    ? Number((performance.reduce((sum, item) => sum + item.predictedMarks, 0) / performance.length).toFixed(2))
    : 0;
  const risk = getRisk(attendance, averageMarks);
  const studyHours = 0;

  return {
    profile: student,
    attendance: {
      overall: attendance,
      totalClasses: attendanceRecords.length,
      present: attendanceRecords.filter((r) => r.status === "present").length,
      absent: attendanceRecords.filter((r) => r.status === "absent").length,
      late: attendanceRecords.filter((r) => r.status === "late").length,
      records: attendanceRecords,
    },
    performance,
    predictedMarks: averageMarks,
    risk,
    studyHours,
    recommendations: getRecommendations(attendance, averageMarks),
    subjects,
    fees,
    payments,
    certificates,
    helpdesk: tickets,
    timetable,
  };
};

const getMyStudent = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Student access required" });
    }

    const student = await getStudentFromUser(req.user._id);
    const bundle = await getStudentBundle(student);

    return res.status(200).json({ success: true, student: { ...student, ...bundle } });
  } catch (error) {
    console.error("GET MY STUDENT ERROR:", error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Failed to fetch student" });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const records = await Attendance.find({ studentId: student._id }).sort({ date: -1 }).lean();
    const grouped = {};

    for (const record of records) {
      if (!grouped[record.subject]) grouped[record.subject] = [];
      grouped[record.subject].push(record);
    }

    const subjects = Object.entries(grouped).map(([subject, items]) => ({
      subject,
      total: items.length,
      present: items.filter((r) => r.status === "present").length,
      absent: items.filter((r) => r.status === "absent").length,
      late: items.filter((r) => r.status === "late").length,
      percentage: calculateAttendance(items),
    }));

    return res.json({ success: true, overall: calculateAttendance(records), subjects, records });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getMyPerformance = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const records = await Marks.find({ studentId: student._id }).sort({ semester: -1 }).lean();
    return res.json({ success: true, performance: buildPerformance(records) });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getMyFees = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const [fees, payments] = await Promise.all([
      StudentFee.find({ studentId: student._id, isActive: true }).populate("feeStructureId", "name category academicYear").sort({ dueDate: 1 }).lean(),
      FeePayment.find({ studentId: student._id }).sort({ paymentDate: -1 }).lean(),
    ]);
    return res.json({ success: true, fees, payments });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const certificates = await Certificate.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, certificates });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getMyTimetable = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const timetable = await TimeTable.find({ section: student.section, academicYear: process.env.ACADEMIC_YEAR || "2026-27" })
      .populate("subjectId", "code name")
      .populate("facultyId", "userId")
      .sort({ dayOrder: 1, startTime: 1 })
      .lean();
    return res.json({ success: true, timetable });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getMyHelpdesk = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const tickets = await HelpDesk.find({ studentId: student._id, isActive: true }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, tickets });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const createHelpdeskTicket = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const { category, subject, description, priority = "Medium" } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: "Category, subject and description are required" });
    }

    const ticketNumber = `UC-${Date.now().toString().slice(-8)}`;
    const ticket = await HelpDesk.create({ studentId: student._id, ticketNumber, category, subject, description, priority });
    return res.status(201).json({ success: true, ticket });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getMyAI = async (req, res) => {
  try {
    const student = await getStudentFromUser(req.user._id);
    const marks = await Marks.find({ studentId: student._id }).lean();
    const attendance = await Attendance.find({ studentId: student._id }).lean();
    const attendancePercentage = calculateAttendance(attendance);
    const performance = buildPerformance(marks);
    const averageMarks = performance.length ? performance.reduce((sum, item) => sum + item.predictedMarks, 0) / performance.length : 0;

    let ai = null;
    try {
      const url = `${process.env.AI_SERVICE_URL || "http://127.0.0.1:8000"}/prediction/risk`;
      const response = await axios.post(url, {
        student_id: String(student._id),
        attendance: attendancePercentage,
        internal_marks: marks.length ? marks.reduce((s, m) => s + Number(m.internalMarks || 0), 0) / marks.length : 0,
        assignment_score: marks.length ? marks.reduce((s, m) => s + Number(m.assignmentScore || 0), 0) / marks.length : 0,
        study_hours: 0,
        previous_marks: marks.length ? marks.reduce((s, m) => s + Number(m.previousMarks || 0), 0) / marks.length : 0,
      }, { timeout: 5000 });
      ai = response.data;
    } catch (error) {
      ai = { risk: getRisk(attendancePercentage, averageMarks), source: "fallback" };
    }

    return res.json({ success: true, risk: ai.risk || getRisk(attendancePercentage, averageMarks), prediction: averageMarks, recommendations: getRecommendations(attendancePercentage, averageMarks), source: ai.source || "ai-service" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyStudent,
  getMyAttendance,
  getMyPerformance,
  getMyFees,
  getMyCertificates,
  getMyTimetable,
  getMyHelpdesk,
  createHelpdeskTicket,
  getMyAI,
};
