const axios = require("axios");
const Student = require("../Models/student");
const Attendance = require("../Models/attandance");
const Marks = require("../Models/marks");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const calculateAttendance = (records) => {
  if (!records.length) return 0;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  return Number((((present + late * 0.5) / records.length) * 100).toFixed(2));
};

const calculateMarks = (records) => {
  if (!records.length) return { internalMarks: 0, assignmentScore: 0, previousMarks: 0 };
  const avg = (key) => records.reduce((sum, r) => sum + Number(r[key] || 0), 0) / records.length;
  return {
    internalMarks: Number(avg("internalMarks").toFixed(2)),
    assignmentScore: Number(avg("assignmentScore").toFixed(2)),
    previousMarks: Number(avg("previousMarks").toFixed(2)),
  };
};

const fallbackRisk = (attendance, marks) => {
  const score = attendance * 0.5 + marks.internalMarks * 0.25 + marks.assignmentScore * 0.1 + marks.previousMarks * 0.15;
  if (attendance < 60 || score < 45) return "HIGH";
  if (attendance < 75 || score < 60) return "MEDIUM";
  return "LOW";
};

const predictRisk = async (input) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/prediction/risk`, input, { timeout: 5000 });
    return response.data?.risk || fallbackRisk(input.attendance, input);
  } catch (error) {
    return fallbackRisk(input.attendance, input);
  }
};

const getStudentRisk = async (studentId) => {
  const student = await Student.findById(studentId).lean();
  if (!student) throw new Error("Student not found");
  const [attendanceRecords, marksRecords] = await Promise.all([
    Attendance.find({ studentId }).lean(),
    Marks.find({ studentId }).lean(),
  ]);
  const attendance = calculateAttendance(attendanceRecords);
  const marks = calculateMarks(marksRecords);
  const input = { student_id: String(student._id), attendance, ...marks, study_hours: 0, previous_marks: marks.previousMarks };
  const risk = await predictRisk(input);
  return {
    studentId: student._id,
    enrollmentNumber: student.enrollmentNumber,
    course: student.course,
    branch: student.branch,
    semester: student.semester,
    section: student.section,
    attendance,
    ...marks,
    studyHours: 0,
    risk,
  };
};

const getBulkRiskAnalysis = async () => {
  const students = await Student.find({}).lean();
  const results = [];
  for (const student of students) results.push(await getStudentRisk(student._id));
  return {
    totalStudents: results.length,
    highRisk: results.filter((s) => s.risk === "HIGH").length,
    mediumRisk: results.filter((s) => s.risk === "MEDIUM").length,
    lowRisk: results.filter((s) => s.risk === "LOW").length,
    students: results,
  };
};

const getCompleteAIAnalytics = async () => {
  const analysis = await getBulkRiskAnalysis();
  const byBranch = {};
  const bySemester = {};
  for (const student of analysis.students) {
    byBranch[student.branch] = (byBranch[student.branch] || 0) + 1;
    bySemester[student.semester] = (bySemester[student.semester] || 0) + 1;
  }
  return { ...analysis, byBranch, bySemester };
};

module.exports = { getStudentRisk, getBulkRiskAnalysis, getCompleteAIAnalytics };
