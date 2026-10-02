const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./Models/user");
const Course = require("./Models/course");
const Branch = require("./Models/branch");
const Semester = require("./Models/semester");
const Faculty = require("./Models/faculty");
const Student = require("./Models/student");
const Parent = require("./Models/parent");
const Subject = require("./Models/subject");
const HelpDesk = require("./Models/helpDesk");
const SubjectFacultyAssignment = require("./Models/subjectFacultyAssignment");
const StudentSubject = require("./Models/studentSubject");
const FeeStructure = require("./Models/feeStructure");
const StudentFee = require("./Models/studentFee");
const FeePayment = require("./Models/feePayment");
const Attendance = require("./Models/attandance");
const Marks = require("./Models/marks");
const Certificate = require("./Models/certification");
const EnrollmentCounter = require("./Models/enrollmentCounter");

const MONGO_URI =
  process.env.DB_CONNECT_STRING || process.env.DB_CONNECT_STRING;

const PASSWORD = "Demo@123";
const ACADEMIC_YEAR = "2026-27";

const courses = [
  ["BTECH", "Bachelor of Technology", "Undergraduate"],
  ["MCA", "Master of Computer Applications", "Postgraduate"],
  ["BCA", "Bachelor of Computer Applications", "Undergraduate"],
  ["MBA", "Master of Business Administration", "Postgraduate"],
  ["BBA", "Bachelor of Business Administration", "Undergraduate"],
  ["DIP-CS", "Diploma in Computer Science", "Diploma"],
  ["BSC-CS", "B.Sc. Computer Science", "Undergraduate"],
  ["MSC-CS", "M.Sc. Computer Science", "Postgraduate"],
  ["BTECH-AI", "B.Tech Artificial Intelligence", "Undergraduate"],
  ["BTECH-DS", "B.Tech Data Science", "Undergraduate"],
];

const branchNames = [
  ["CSE", "Computer Science and Engineering"],
  ["IT", "Information Technology"],
];

const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Arjun",
  "Rohan",
  "Rahul",
  "Karan",
  "Aman",
  "Ankit",
  "Dev",
];

const lastNames = [
  "Sharma",
  "Patel",
  "Verma",
  "Singh",
  "Gupta",
  "Yadav",
  "Mehta",
  "Jain",
  "Khan",
  "Joshi",
];

const subjects = [
  ["DBMS", "Database Management System", "Core"],
  ["CN", "Computer Networks", "Core"],
  ["OS", "Operating Systems", "Core"],
  ["DSA", "Data Structures and Algorithms", "Core"],
  ["WT", "Web Technology", "Core"],
  ["AI", "Artificial Intelligence", "Elective"],
  ["ML", "Machine Learning", "Elective"],
  ["IOT", "Internet of Things", "Practical"],
  ["SE", "Software Engineering", "Core"],
  ["CG", "Computer Graphics", "Lab"],
];

const pick = (arr, i) =>
  arr[i % arr.length];

const personName = (i) =>
  `${pick(firstNames, i)} ${pick(
    lastNames,
    Math.floor(i / firstNames.length)
  )}`;

const emailName = (name) =>
  name.toLowerCase().replace(/\s+/g, ".");


async function clearCollections() {
  const models = [
    User,
    Course,
    Branch,
    Semester,
    Faculty,
    Student,
    Parent,
    Subject,
    HelpDesk,
    SubjectFacultyAssignment,
    StudentSubject,
    FeeStructure,
    StudentFee,
    FeePayment,
    Attendance,
    Marks,
    Certificate,
    EnrollmentCounter,
  ];

  await Promise.all(
    models.map((model) =>
      model.deleteMany({})
    )
  );

  await mongoose.connection
    .collection("hostels")
    .deleteMany({});

  await mongoose.connection
    .collection("transports")
    .deleteMany({});

  await mongoose.connection
    .collection("timetables")
    .deleteMany({});
}

async function seed() {
  if (!MONGO_URI) {
    throw new Error(
      "MONGO_URI or MONGODB_URI is missing in .env"
    );
  }

  await mongoose.connect(MONGO_URI);

  console.log("MongoDB connected");

  await clearCollections();

  const passwordHash =
    await bcrypt.hash(PASSWORD, 10);

      const admin = await User.create({
    name: "Unified Campus Admin",
    email: "admin@unifiedcampus.demo",
    password: passwordHash,
    role: "admin",
    phone: "9999999999",
    isActive: true,
  });

  const studentUsers =
    await User.insertMany(
      Array.from({ length: 100 }, (_, i) => ({
        name: personName(i),

        email:
          `student${String(i + 1).padStart(3, "0")}` +
          "@unifiedcampus.demo",

        password: passwordHash,

        role: "student",

        phone:
          `98${String(
            10000000 + i
          ).slice(-8)}`,

        isActive: true,
      }))
    );

  const facultyUsers =
    await User.insertMany(
      Array.from({ length: 100 }, (_, i) => ({
        name:
          `Faculty ${personName(i)}`,

        email:
          `faculty${String(i + 1).padStart(3, "0")}` +
          "@unifiedcampus.demo",

        password: passwordHash,

        role: "faculty",

        phone:
          `97${String(
            10000000 + i
          ).slice(-8)}`,

        isActive: true,
      }))
    )

      const courseDocs = await Course.insertMany(
    courses.map(([code, name, type], i) => ({
      courseCode: code,
      courseName: name,
      courseType: type,
      duration:
        type === "Diploma" ? 3 : 4,
      durationUnit: "Years",
      description:
        `Demo academic course for Unified Campus ${i + 1}`,
      isActive: true,
    }))
  );

  const branchDocs = [];

  for (
    let i = 0;
    i < courseDocs.length;
    i++
  ) {
    for (
      let j = 0;
      j < branchNames.length;
      j++
    ) {
      branchDocs.push({
        courseId: courseDocs[i]._id,

        branchCode:
          `${branchNames[j][0]}${i + 1}`,

        branchName:
          branchNames[j][1],

        description:
          `Demo branch for ${courseDocs[i].courseName}`,

        hod: null,

        isActive: true,
      });
    }
  }

  const insertedBranches =
    await Branch.insertMany(branchDocs);

  const semesterDocs = [];

  for (const branch of insertedBranches) {
    for (let s = 1; s <= 5; s++) {
      semesterDocs.push({
        courseId: branch.courseId,

        branchId: branch._id,

        semesterNumber: s,

        semesterName:
          `Semester ${s}`,

        isActive: true,
      });
    }
  }

  const semesterDocsInserted =
    await Semester.insertMany(
      semesterDocs
    );

  const facultyDocs =
    await Faculty.insertMany(
      facultyUsers.map((u, i) => ({
        userId: u._id,

        facultyId:
          `FAC${String(i + 1).padStart(4, "0")}`,

        employeeId:
          `EMP${String(i + 1).padStart(4, "0")}`,

        dateOfBirth:
          new Date(
            1980 + (i % 15),
            i % 12,
            1 + (i % 27)
          ),

        gender:
          ["Male", "Female", "Other"][
            i % 3
          ],

        department:
          [
            "Computer Science",
            "Information Technology",
            "Management",
          ][i % 3],

        designation:
          [
            "Assistant Professor",
            "Associate Professor",
            "Professor",
          ][i % 3],

        qualification:
          ["M.Tech", "MCA", "Ph.D"][
            i % 3
          ],

        specialization:
          [
            "AI",
            "Web Development",
            "Database Systems",
            "Networks",
          ][i % 4],

        joiningDate:
          new Date(
            2018 + (i % 7),
            i % 12,
            1
          ),

        experience:
          2 + (i % 15),

        employmentType:
          [
            "Full Time",
            "Part Time",
            "Contract",
            "Visiting",
          ][i % 4],

        section:
          ["A", "B", "C"][i % 3],

        address:
          `${100 + i} Faculty Road, Unified Campus`,
      }))
    );

  await Promise.all(
    insertedBranches.map((branch, i) =>
      Branch.updateOne(
        { _id: branch._id },
        {
          $set: {
            hod: facultyDocs[i % facultyDocs.length]._id,
          },
        }
      )
    )
  );

      const studentDocs =
    await Student.insertMany(
      studentUsers.map((u, i) => {
        const branch =
          insertedBranches[
            i % insertedBranches.length
          ];

        return {
          userId: u._id,

          enrollmentNumber:
            `UC${2026}${String(i + 1).padStart(5, "0")}`,

          dateOfBirth:
            new Date(
              2003 + (i % 5),
              i % 12,
              1 + (i % 27)
            ),

          gender:
            ["Male", "Female", "Other"][
              i % 3
            ],

          course:
            String(branch.courseId),

          branch:
            String(branch._id),

          semester:
            (i % 5) + 1,

          section:
            ["A", "B", "C"][i % 3],

          admissionYear:
            2026 - (i % 3),

          address:
            `${i + 1} Student Colony, Durg`,
        };
      })
    );


  await Parent.insertMany(
    studentDocs.map((student, i) => ({
      studentId: student._id,

      fatherName:
        `Father ${personName(i)}`,

      fatherPhone:
        `91${String(
          90000000 + i
        ).slice(-8)}`,

      fatherEmail:
        `father${i + 1}@example.com`,

      fatherOccupation:
        [
          "Business",
          "Teacher",
          "Engineer",
          "Farmer",
        ][i % 4],

      motherName:
        `Mother ${personName(i)}`,

      motherPhone:
        `91${String(
          80000000 + i
        ).slice(-8)}`,

      motherEmail:
        `mother${i + 1}@example.com`,

      motherOccupation:
        [
          "Teacher",
          "Homemaker",
          "Business",
          "Government Service",
        ][i % 4],

      guardianName:
        i % 4 === 0
          ? `Guardian ${i + 1}`
          : "",

      guardianPhone:
        i % 4 === 0
          ? `91${String(
              70000000 + i
            ).slice(-8)}`
          : "",

      guardianRelation:
        i % 4 === 0
          ? "Uncle"
          : "",

      address:
        `${i + 1} Family Street`,

      city: "Durg",

      state: "Chhattisgarh",

      pincode:
        `49100${String(i).padStart(2, "0")}`,

      isActive: true,
    }))
  );

  const subjectDocs = [];

  for (let i = 0; i < 100; i++) {
    const semester =
      semesterDocsInserted[
        i % semesterDocsInserted.length
      ];

    const subjectInfo =
      pick(subjects, i);

    subjectDocs.push({
      courseId:
        semester.courseId,

      branchId:
        semester.branchId,

      semesterId:
        semester._id,

      subjectCode:
        `${subjectInfo[0]}${String(
          i + 1
        ).padStart(3, "0")}`,

      subjectName:
        `${subjectInfo[1]} ${i + 1}`,

      subjectType:
        subjectInfo[2],

      credits:
        2 + (i % 4),

      maxMarks: 100,

      passingMarks: 40,

      isActive: true,
    });
  }

  const subjectDocsInserted =
    await Subject.insertMany(
      subjectDocs
    );
  await SubjectFacultyAssignment.insertMany(
    subjectDocsInserted.map((subject, i) => ({
      subjectId: subject._id,

      facultyId:
        facultyDocs[
          i % facultyDocs.length
        ]._id,

      section:
        ["A", "B", "C"][i % 3],

      academicYear:
        ACADEMIC_YEAR,

      assignmentStatus:
        "Assigned",

      assignedAt:
        new Date(),
    }))
  );

  await StudentSubject.insertMany(
    studentDocs.map((student, i) => ({
      studentId: student._id,

      subjectId:
        subjectDocsInserted[
          i % subjectDocsInserted.length
        ]._id,

      enrollmentStatus:
        [
          "Enrolled",
          "Completed",
          "Dropped",
        ][i % 3],
    }))
  );

  const feeStructureDocs =
    semesterDocsInserted.map(
      (semester, i) => {
        const feeItems = [
          {
            feeType: "Tuition Fee",
            amount:
              35000 +
              (i % 5) * 1000,
          },

          {
            feeType: "Library Fee",
            amount: 2000,
          },

          {
            feeType: "Exam Fee",
            amount: 1500,
          },

          {
            feeType: "Development Fee",
            amount: 2500,
          },
        ];

        return {
          courseId:
            semester.courseId,

          branchId:
            semester.branchId,

          semesterId:
            semester._id,

          academicYear:
            `${2026 + Math.floor(i / 50)}-${String(
              27 + Math.floor(i / 50)
            ).padStart(2, "0")}`,

          feeItems,

          totalAmount:
            feeItems.reduce(
              (sum, item) =>
                sum + item.amount,
              0
            ),

          isActive: true,
        };
      }
    );

  const insertedFeeStructures =
    await FeeStructure.insertMany(
      feeStructureDocs
    );

  const studentFeeDocs =
    studentDocs.map(
      (student, i) => {
        const structure =
          insertedFeeStructures[
            i %
              insertedFeeStructures.length
          ];

        const discount =
          i % 5 === 0
            ? 2000
            : 0;

        const payable =
          structure.totalAmount -
          discount;

        const paid =
          i % 3 === 0
            ? payable
            : i % 3 === 1
              ? Math.floor(
                  payable / 2
                )
              : 0;

        const due =
          payable - paid;

        const status =
          due === 0
            ? "Paid"
            : paid > 0
              ? "Partial"
              : "Pending";

        return {
          studentId:
            student._id,

          feeStructureId:
            structure._id,

          academicYear:
            structure.academicYear,

          totalAmount:
            structure.totalAmount,

          discount,

          payableAmount:
            payable,

          paidAmount:
            paid,

          dueAmount:
            due,

          dueDate:
            new Date(
              2027,
              2,
              31
            ),

          status,

          remarks:
            "Demo student fee record",

          isActive: true,
        };
      }
    );

  const insertedStudentFees =
    await StudentFee.insertMany(
      studentFeeDocs
    );

  const paymentDocs =
    insertedStudentFees
      .map((fee, i) => {
        if (
          fee.paidAmount <= 0
        ) {
          return null;
        }

        return {
          studentFeeId:
            fee._id,

          studentId:
            fee.studentId,

          amount:
            fee.paidAmount,

          paymentMethod:
            [
              "Cash",
              "UPI",
              "Card",
              "Net Banking",
              "Bank Transfer",
              "Cheque",
            ][i % 6],

          transactionId:
            `TXN${Date.now()}${String(
              i
            ).padStart(3, "0")}`,

          paymentDate:
            new Date(
              2026,
              8,
              1 + (i % 25)
            ),

          receiptNumber:
            `UC-FEE-${String(
              i + 1
            ).padStart(5, "0")}`,

          status:
            "Success",

          remarks:
            "Demo fee payment",
        };
      })
      .filter(Boolean);

  await FeePayment.insertMany(
    paymentDocs
  );



    await Attendance.insertMany(
    studentDocs.map(
      (student, i) => ({
        studentId:
          student._id,

        subject:
          subjectDocsInserted[
            i %
              subjectDocsInserted.length
          ].subjectName,

        facultyId:
          facultyDocs[
            i %
              facultyDocs.length
          ]._id,

        date:
          new Date(
            2026,
            8,
            1 + (i % 25)
          ),

        status:
          [
            "present",
            "absent",
            "late",
          ][i % 3],
      })
    )
  );

  await Marks.insertMany(
    studentDocs.map(
      (student, i) => ({
        studentId:
          student._id,

        subject:
          subjectDocsInserted[
            i %
              subjectDocsInserted.length
          ].subjectName,

        internalMarks:
          15 + (i % 11),

        assignmentScore:
          7 + (i % 9),

        previousMarks:
          45 + (i % 41),

        semester:
          (i % 5) + 1,
      })
    )
  );

  await Certificate.insertMany(
    studentDocs.map(
      (student, i) => ({
        studentId:
          student._id,

        certificateType:
          [
            "bonafide",
            "transfer",
            "character",
            "degree",
            "marksheet",
          ][i % 5],

        status:
          [
            "requested",
            "approved",
            "issued",
          ][i % 3],

        certificateUrl:
          `https://example.com/certificates/UC-${i + 1}.pdf`,

        issuedAt:
          i % 3 === 2
            ? new Date(
                2026,
                8,
                10 + (i % 15)
              )
            : null,
      })
    )
  );

  await HelpDesk.insertMany(
    studentDocs.map((student, i) => ({
      ticketNumber: `UC-HD-${String(i + 1).padStart(4, "0")}`,
      studentId: student._id,
      category: [
        "Academic",
        "Fees",
        "Attendance",
        "Examination",
        "Technical",
        "Hostel",
        "Transport",
        "Certificate",
        "Library",
        "Other",
      ][i % 10],
      subject: [
        "Subject registration issue",
        "Fee payment query",
        "Attendance correction",
        "Examination related query",
        "Portal technical issue",
        "Hostel room request",
        "Transport route query",
        "Certificate request",
        "Library related query",
        "General support request",
      ][i % 10],
      description: `Demo help desk request ${i + 1} for Unified Campus.`,
      priority: ["Low", "Medium", "High", "Urgent"][i % 4],
      status: ["Open", "In Progress", "Resolved", "Closed"][i % 4],
      assignedTo: i % 2 === 0 ? facultyDocs[i % facultyDocs.length]._id : null,
      response:
        i % 4 >= 2
          ? `Demo response for ticket ${i + 1}.`
          : "",
      resolvedAt:
        i % 4 >= 2
          ? new Date(2026, 8, 10 + (i % 15))
          : null,
      closedAt:
        i % 4 === 3
          ? new Date(2026, 8, 15 + (i % 10))
          : null,
      isActive: true,
    }))
  );

  await EnrollmentCounter.insertMany(
    Array.from(
      { length: 100 },
      (_, i) => ({
        courseKey:
          String(
            courseDocs[
              i % courseDocs.length
            ]._id
          ),

        branchKey:
          String(
            insertedBranches[
              i %
                insertedBranches.length
            ]._id
          ),

        admissionYear:
          2022 +
          Math.floor(i / 20),

        sequence:
          100 + i,
      })
    )
  );

  await mongoose.connection
    .collection("hostels")
    .insertMany(
      studentDocs.map(
        (student, i) => ({
          studentId:
            student._id,

          hostelName:
            `Unified Hostel ${
              (i % 5) + 1
            }`,

          roomNumber:
            `R-${100 + i}`,

          bedNumber:
            `B-${(i % 4) + 1}`,

          status:
            i % 5 === 0
              ? "vacant"
              : "allocated",

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        })
      )
    );

  await mongoose.connection
    .collection("transports")
    .insertMany(
      studentDocs.map(
        (student, i) => ({
          studentId:
            student._id,

          routeName:
            `Route ${
              (i % 10) + 1
            }`,

          busNumber:
            `UC-BUS-${String(
              (i % 20) + 1
            ).padStart(2, "0")}`,

          pickupPoint:
            `Point ${
              (i % 15) + 1
            }`,

          driverName:
            `Driver ${i + 1}`,

          status:
            i % 8 === 0
              ? "inactive"
              : "active",

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        })
      )
    );

  await mongoose.connection
    .collection("timetables")
    .insertMany(
      subjectDocsInserted.map(
        (subject, i) => ({
          subjectId:
            subject._id,

          facultyId:
            facultyDocs[
              i %
                facultyDocs.length
            ]._id,

          section:
            ["A", "B", "C"][
              i % 3
            ],

          academicYear:
            ACADEMIC_YEAR,

          day:
            [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ][i % 5],

          startTime:
            `${9 + (i % 5)}:00`,

          endTime:
            `${10 + (i % 5)}:00`,

          room:
            `Room ${
              101 + (i % 20)
            }`,

          createdAt:
            new Date(),

          updatedAt:
            new Date(),
        })
      )
    );

  console.log(
    "\nUnified Campus seed completed successfully.\n"
  );

  console.log(
    `Admin: admin@unifiedcampus.demo / ${PASSWORD}`
  );

  console.log(
    `Students: ${studentUsers.length}`
  );

  console.log(
    `Faculty: ${facultyUsers.length}`
  );

  console.log(
    `Courses: ${courseDocs.length}`
  );

  console.log(
    `Branches: ${insertedBranches.length}`
  );

  console.log(
    `Semesters: ${semesterDocsInserted.length}`
  );

  console.log(
    `Subjects: ${subjectDocsInserted.length}`
  );

  console.log(
    `Student Fees: ${insertedStudentFees.length}`
  );

  console.log(
    `Help Desk: 100`
  );

  console.log(
    `Fee Payments: ${paymentDocs.length}`
  );

  console.log(
    `Hostels: 100`
  );

  console.log(
    `Transports: 100`
  );

  console.log(
    `Timetables: 100`
  );
}

seed()
  .catch((error) => {
    console.error(
      "SEED ERROR:",
      error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });