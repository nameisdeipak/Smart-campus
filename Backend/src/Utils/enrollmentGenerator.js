const EnrollmentCounter = require("../Models/enrollmentCounter");
const Student = require("../Models/student");

const branchCodes = {
  "information technology": "IT",
  it: "IT",

  "computer science": "CS",
  "computer science and engineering": "CS",
  cse: "CS",

  "electronics and communication": "EC",
  "electronics and communication engineering": "EC",
  ece: "EC",

  "electrical engineering": "EE",
  ee: "EE",

  "mechanical engineering": "ME",
  me: "ME",

  "civil engineering": "CE",
  ce: "CE",
};

const getBranchCode = (branch) => {
  const normalizedBranch = branch.trim().toLowerCase();

  const code = branchCodes[normalizedBranch];

  if (!code) {
    throw new Error(
      `Unsupported branch: ${branch}`
    );
  }

  return code;
};

const generateEnrollmentNumber = async ({
  course,
  branch,
  admissionYear,
}) => {
  const branchCode = getBranchCode(branch);

  const courseKey = course
    .trim()
    .toLowerCase();

  const branchKey = branch
    .trim()
    .toLowerCase();

  /*
    Atomic counter increment.

    Example:
    First student → sequence 1
    Second student → sequence 2
    Third student → sequence 3
  */

  const counter =
    await EnrollmentCounter.findOneAndUpdate(
      {
        courseKey,
        branchKey,
        admissionYear,
      },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

  const sequence = String(
    counter.sequence
  ).padStart(4, "0");

  const yearCode = String(
    admissionYear
  ).slice(-2);

  const enrollmentNumber =
    `${sequence}${branchCode}${yearCode}`;

  /*
    Extra safety check.
  */

  const existingStudent =
    await Student.findOne({
      enrollmentNumber,
    });

  if (existingStudent) {
    throw new Error(
      `Enrollment number ${enrollmentNumber} already exists`
    );
  }

  return enrollmentNumber;
};

module.exports = {
  generateEnrollmentNumber,
  getBranchCode,
};