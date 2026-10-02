const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const User = require("./Models/user");
const Student = require("./Models/student");
const Faculty = require("./Models/faculty");
const Course = require("./Models/course");
const Branch = require("./Models/branch");
const Semester = require("./Models/semester");
const Subject = require("./Models/subject");
const SubjectFacultyAssignment = require("./Models/subjectFacultyAssignment");
const StudentSubject = require("./Models/studentSubject");
const Parent = require("./Models/parent");
const FeeStructure = require("./Models/feeStructure");
const StudentFee = require("./Models/studentFee");
const FeePayment = require("./Models/feePayment");
const Attendance = require("./Models/attandance");
const Marks = require("./Models/marks");
const Certificate = require("./Models/certification");
const HelpDesk = require("./Models/helpDesk");
const TimeTable = require("./Models/timeTable");

const EMAIL = "test@unifiedcampus.demo";
const PASSWORD = "Demo@123";
const FACULTY_EMAIL = "demo.faculty@unifiedcampus.dem";
const ACADEMIC_YEAR = "2026-27";
const COURSE_CODE = "DEMO-BTECH";
const BRANCH_CODE = "DEMO-CSE";
const SECTION = "DEMO";
const ENROLLMENT_NUMBER = "DEMO-FEE-2026-001";
const FEE_REMARKS = "Demo student fee record";
const demoSubjects = [
  ["DEMO-DBMS", "Database Management Systems", "Core", 4],
  ["DEMO-WEB", "Web Development", "Core", 4],
  ["DEMO-DSA", "Data Structures and Algorithms", "Core", 4],
  ["DEMO-NET", "Computer Networks", "Core", 3],
  ["DEMO-LAB", "Programming Laboratory", "Practical", 2],
];

async function getOrCreateDemoCourse() {
  return Course.findOneAndUpdate(
    { courseCode: COURSE_CODE },
    {
      $set: {
        courseName: "Demo Bachelor of Technology",
        courseType: "Undergraduate",
        duration: 4,
        durationUnit: "Years",
        description: "Academic setup for the demo student account",
        isActive: true,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function getOrCreateDemoBranch(courseId) {
  return Branch.findOneAndUpdate(
    { courseId, branchCode: BRANCH_CODE },
    {
      $set: {
        branchName: "Demo Computer Science",
        description: "Branch for the demo student account",
        isActive: true,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function getOrCreateDemoSemester(courseId, branchId) {
  return Semester.findOneAndUpdate(
    { branchId, semesterNumber: 1 },
    {
      $set: {
        courseId,
        semesterName: "Semester 1",
        isActive: true,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

async function rebuildDemoStudent() {
  const mongoUri = process.env.DB_CONNECT_STRING;

  if (!mongoUri) {
    throw new Error("DB_CONNECT_STRING is missing in Backend/.env");
  }

  await mongoose.connect(mongoUri);

  try {
    let user = await User.findOne({ email: EMAIL });
    if (user && user.role !== "student") {
      throw new Error(`${EMAIL} exists but is not a student account`);
    }

    const conflictingEnrollment = await Student.findOne({
      enrollmentNumber: ENROLLMENT_NUMBER,
      ...(user ? { userId: { $ne: user._id } } : {}),
    }).select("_id");
    if (conflictingEnrollment) {
      throw new Error(
        `Enrollment ${ENROLLMENT_NUMBER} belongs to another student; no records were deleted`
      );
    }

    let facultyUser = await User.findOne({ email: FACULTY_EMAIL });
    if (facultyUser && facultyUser.role !== "faculty") {
      throw new Error(`${FACULTY_EMAIL} exists but is not a faculty account`);
    }

    const existingDemoFaculty = facultyUser
      ? await Faculty.findOne({ userId: facultyUser._id })
      : null;
    const conflictingFaculty = await Faculty.findOne({
      $or: [{ facultyId: "DEMO-FAC-001" }, { employeeId: "DEMO-EMP-001" }],
      ...(existingDemoFaculty ? { _id: { $ne: existingDemoFaculty._id } } : {}),
    }).select("_id");
    if (conflictingFaculty) {
      throw new Error(
        "Demo faculty identifiers are already used by another faculty member"
      );
    }

    const oldStudents = await Student.find({
      $or: [
        ...(user ? [{ userId: user._id }] : []),
        { enrollmentNumber: ENROLLMENT_NUMBER },
      ],
    }).select("_id");
    const oldStudentIds = oldStudents.map((student) => student._id);

    if (oldStudentIds.length) {
      const oldFees = await StudentFee.find({
        studentId: { $in: oldStudentIds },
      }).select("_id");
      const oldFeeIds = oldFees.map((fee) => fee._id);

      await Promise.all([
        Attendance.deleteMany({ studentId: { $in: oldStudentIds } }),
        Marks.deleteMany({ studentId: { $in: oldStudentIds } }),
        StudentSubject.deleteMany({ studentId: { $in: oldStudentIds } }),
        Parent.deleteMany({ studentId: { $in: oldStudentIds } }),
        StudentFee.deleteMany({ studentId: { $in: oldStudentIds } }),
        FeePayment.deleteMany({
          $or: [
            { studentId: { $in: oldStudentIds } },
            ...(oldFeeIds.length
              ? [{ studentFeeId: { $in: oldFeeIds } }]
              : []),
          ],
        }),
        Certificate.deleteMany({ studentId: { $in: oldStudentIds } }),
        HelpDesk.deleteMany({ studentId: { $in: oldStudentIds } }),
        mongoose.connection
          .collection("hostels")
          .deleteMany({ studentId: { $in: oldStudentIds } }),
        mongoose.connection
          .collection("transports")
          .deleteMany({ studentId: { $in: oldStudentIds } }),
        Student.deleteMany({ _id: { $in: oldStudentIds } }),
      ]);
    }

    if (user) {
      await User.deleteOne({ _id: user._id });
    }

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    user = await User.create({
      name: "Demo Student",
      email: EMAIL,
      password: passwordHash,
      role: "student",
      phone: "9000000001",
      isActive: true,
    });

    if (!facultyUser) {
      facultyUser = await User.create({
        name: "Demo Faculty",
        email: FACULTY_EMAIL,
        password: passwordHash,
        role: "faculty",
        phone: "9000000002",
        isActive: true,
      });
    }

    const course = await getOrCreateDemoCourse();
    const branch = await getOrCreateDemoBranch(course._id);
    const semester = await getOrCreateDemoSemester(course._id, branch._id);
    const faculty = await Faculty.findOneAndUpdate(
      { userId: facultyUser._id },
      {
        $set: {
          facultyId: "DEMO-FAC-001",
          employeeId: "DEMO-EMP-001",
          gender: "Other",
          department: "Computer Science",
          designation: "Assistant Professor",
          qualification: "M.Tech",
          specialization: "Computer Science",
          joiningDate: new Date("2022-07-01T00:00:00.000Z"),
          experience: 4,
          employmentType: "Full Time",
          section: SECTION,
          address: "Unified Campus",
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const student = await Student.create({
      userId: user._id,
      enrollmentNumber: ENROLLMENT_NUMBER,
      dateOfBirth: new Date("2006-01-15T00:00:00.000Z"),
      gender: "Other",
      course: String(course._id),
      branch: String(branch._id),
      semester: 1,
      section: SECTION,
      admissionYear: 2026,
      address: "Demo Address, Unified Campus",
    });

    await Parent.create({
      studentId: student._id,
      fatherName: "Demo Father",
      fatherPhone: "9000000003",
      fatherEmail: "demo.father@unifiedcampus.dem",
      fatherOccupation: "Engineer",
      motherName: "Demo Mother",
      motherPhone: "9000000004",
      motherEmail: "demo.mother@unifiedcampus.dem",
      motherOccupation: "Teacher",
      address: "Demo Address, Unified Campus",
      city: "Durg",
      state: "Chhattisgarh",
      pincode: "491001",
      isActive: true,
    });

    const subjects = [];
    for (const [subjectCode, subjectName, subjectType, credits] of demoSubjects) {
      const subject = await Subject.findOneAndUpdate(
        { semesterId: semester._id, subjectCode },
        {
          $set: {
            courseId: course._id,
            branchId: branch._id,
            subjectName,
            subjectType,
            credits,
            maxMarks: 100,
            passingMarks: 35,
            isActive: true,
          },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      subjects.push(subject);
    }

    await Promise.all([
      StudentSubject.insertMany(
        subjects.map((subject) => ({
          studentId: student._id,
          subjectId: subject._id,
          enrollmentStatus: "Enrolled",
        }))
      ),
      SubjectFacultyAssignment.bulkWrite(
        subjects.map((subject) => ({
          updateOne: {
            filter: {
              subjectId: subject._id,
              facultyId: faculty._id,
              section: SECTION,
              academicYear: ACADEMIC_YEAR,
            },
            update: {
              $set: { assignmentStatus: "Assigned" },
              $setOnInsert: { assignedAt: new Date() },
            },
            upsert: true,
          },
        }))
      ),
      Marks.insertMany(
        subjects.map((subject, index) => ({
          studentId: student._id,
          subject: subject.subjectName,
          internalMarks: 66 + (index % 5) * 4,
          assignmentScore: 72 + (index % 4) * 5,
          previousMarks: 68 + (index % 6) * 3,
          semester: 1,
        }))
      ),
      Certificate.insertMany([
        {
          studentId: student._id,
          certificateType: "bonafide",
          status: "issued",
          issuedAt: new Date(),
        },
        {
          studentId: student._id,
          certificateType: "marksheet",
          status: "approved",
        },
      ]),
      HelpDesk.insertMany([
        {
          studentId: student._id,
          ticketNumber: `DEMO-${student._id}-TKT-001`,
          category: "Academic",
          subject: "Demo academic query",
          description: "Sample ticket for the student helpdesk page.",
          priority: "Medium",
          status: "In Progress",
          response: "Your demo request is being reviewed.",
        },
        {
          studentId: student._id,
          ticketNumber: `DEMO-${student._id}-TKT-002`,
          category: "Fees",
          subject: "Fee receipt clarification",
          description: "Sample ticket for the fee support flow.",
          priority: "Low",
          status: "Open",
        },
      ]),
      mongoose.connection.collection("hostels").insertOne({
        studentId: student._id,
        hostelName: "Demo Campus Hostel",
        roomNumber: "D-101",
        bedNumber: "1",
        status: "allocated",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      mongoose.connection.collection("transports").insertOne({
        studentId: student._id,
        routeName: "Demo Campus Route",
        busNumber: "DEMO-01",
        pickupPoint: "Central Bus Stop",
        driverName: "Demo Driver",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const feeItems = [
      { feeType: "Tuition Fee", amount: 100000 },
      { feeType: "Laboratory Fee", amount: 15000 },
      { feeType: "Development Fee", amount: 5000 },
    ];
    const totalAmount = feeItems.reduce((total, item) => total + item.amount, 0);
    const feeStructure = await FeeStructure.findOneAndUpdate(
      {
        courseId: course._id,
        branchId: branch._id,
        semesterId: semester._id,
        academicYear: ACADEMIC_YEAR,
      },
      {
        $set: {
          feeItems,
          totalAmount,
          isActive: true,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const discount = 5000;
    const payableAmount = totalAmount - discount;
    const paymentAmounts = [
      Math.floor(payableAmount * 0.25),
      Math.floor(payableAmount * 0.15),
    ];
    const paidAmount = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
    const dueDate = new Date("2027-03-31T12:00:00.000Z");
    const studentFee = await StudentFee.create({
      studentId: student._id,
      feeStructureId: feeStructure._id,
      academicYear: ACADEMIC_YEAR,
      totalAmount,
      discount,
      payableAmount,
      paidAmount,
      dueAmount: payableAmount - paidAmount,
      dueDate,
      status: "Partial",
      remarks: FEE_REMARKS,
      isActive: true,
    });

    await FeePayment.insertMany(
      paymentAmounts.map((amount, index) => ({
        studentFeeId: studentFee._id,
        studentId: student._id,
        amount,
        paymentMethod: index === 0 ? "UPI" : "Card",
        transactionId: `DEMO-${student._id}-TXN-${String(index + 1).padStart(2, "0")}`,
        paymentDate: new Date(`2026-0${8 + index}-15T12:00:00.000Z`),
        receiptNumber: `DEMO-${student._id}-FEE-${String(index + 1).padStart(2, "0")}`,
        status: "Success",
        remarks: "Demo seed payment",
      }))
    );

    const schedule = [
      ["Monday", "09:00", "10:00"],
      ["Tuesday", "10:00", "11:00"],
      ["Wednesday", "11:00", "12:00"],
      ["Thursday", "13:00", "14:00"],
      ["Friday", "14:00", "15:00"],
    ];
    await Promise.all(
      subjects.map((subject, index) =>
        TimeTable.findOneAndUpdate(
          {
            subjectId: subject._id,
            section: SECTION,
            academicYear: ACADEMIC_YEAR,
            day: schedule[index][0],
            startTime: schedule[index][1],
          },
          {
            $set: {
              facultyId: faculty._id,
              endTime: schedule[index][2],
              room: `D-${101 + index}`,
              dayOrder: index + 1,
            },
          },
          { upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
      )
    );

    const attendanceDocs = [];
    const statusPattern = [
      "present",
      "present",
      "late",
      "present",
      "absent",
      "present",
      "present",
      "present",
    ];
    for (let classIndex = 0; classIndex < 8; classIndex += 1) {
      for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
        const daysAgo = 3 + classIndex * 3;
        attendanceDocs.push({
          studentId: student._id,
          subject: subjects[subjectIndex].subjectName,
          facultyId: faculty._id,
          date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          status: statusPattern[(classIndex + subjectIndex) % statusPattern.length],
        });
      }
    }
    await Attendance.insertMany(attendanceDocs);

    console.log("Demo student and all linked sample data created.");
    console.log(`Login email: ${EMAIL}`);
    console.log(`Login password: ${PASSWORD}`);
    console.log(`Enrollment: ${student.enrollmentNumber}`);
    console.log(`Payable: ₹${payableAmount.toLocaleString("en-IN")}`);
    console.log(`Paid: ₹${paidAmount.toLocaleString("en-IN")}`);
    console.log(
      `Due: ₹${(payableAmount - paidAmount).toLocaleString("en-IN")} (Partial)`
    );
    console.log(
      "Created course, subjects, attendance, marks, timetable, certificates, helpdesk, hostel, transport, parent, and fee/payment records."
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  rebuildDemoStudent().catch((error) => {
    console.error("Failed to rebuild demo student:", error);
    process.exitCode = 1;
  });
}

module.exports = { rebuildDemoStudent };
