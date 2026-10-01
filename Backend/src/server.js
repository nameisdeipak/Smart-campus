const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./Config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./Routes/authRoutes");
const adminStudentRoutes = require("./Routes/adminStudentRoutes");
const adminFacultyRoutes = require("./Routes/adminFacultyRoutes");
const adminCourseRoutes = require("./Routes/adminCourseRoutes");
const adminBranchRoutes = require("./Routes/adminBranchRoutes");
const adminSemesterRoutes = require("./Routes/adminSemesterRoutes");
const adminSubjectRoutes = require("./Routes/adminSubjectRoutes");
const adminSubjectFacultyAssignmentRoutes = require("./Routes/adminSubjectFacultyAssignmentRoutes");
const studentSubjectRoutes = require("./Routes/studentSubjectRoutes");
const adminParentRoutes = require("./Routes/adminParentRoutes");
const adminFeeStructureRoutes = require("./Routes/adminFeeStructureRoutes");
const adminStudentFeeRoutes = require("./Routes/adminStudentFeeRoutes");
const adminFeePaymentRoutes = require("./Routes/adminFeePaymentRoutes");
const adminDashboardRoutes = require("./Routes/adminDashboardRoutes");
const adminAIAnalyticsRoutes = require("./Routes/adminAIAnalyticsRoutes");
const studentRoutes = require("./Routes/studentRoutes");
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/unified_campus/auth", authRoutes);
app.use("/unified_campus/admin/students", adminStudentRoutes);
app.use("/unified_campus/admin/faculty", adminFacultyRoutes);
app.use("/unified_campus/admin/courses", adminCourseRoutes);
app.use("/unified_campus/admin/branches", adminBranchRoutes);
app.use("/unified_campus/admin/semesters", adminSemesterRoutes);
app.use("/unified_campus/admin/subjects", adminSubjectRoutes);
app.use(
  "/unified_campus/admin/subject-faculty",
  adminSubjectFacultyAssignmentRoutes,
);
app.use("/unified_campus/admin/student-subjects", studentSubjectRoutes);
app.use("/unified_campus/admin/parents", adminParentRoutes);
app.use("/unified_campus/admin/fee-structures", adminFeeStructureRoutes);
app.use("/unified_campus/admin/student-fees", adminStudentFeeRoutes);
app.use("/unified_campus/admin/fee-payments", adminFeePaymentRoutes);
app.use("/unified_campus/admin/dashboard", adminDashboardRoutes);
app.use("/unified_campus/admin/ai-analytics", adminAIAnalyticsRoutes);

// student related 
app.use(
  "/unified_campus/student",
  studentRoutes
);

const InitalizeConnection = async () => {
  try {
    await main();
    console.log("DB's  Connected");

    app.listen(process.env.PORT, () => {
      console.log("Server Listening at port" + process.env.PORT);
    });
  } catch (err) {
    console.log("Error: " + err);
  }
};

InitalizeConnection();
