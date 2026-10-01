const mongoose = require("mongoose");

const studentSubjectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    enrollmentStatus: {
      type: String,
      enum: ["Enrolled", "Dropped", "Completed"],
      default: "Enrolled",
    },
  },
  {
    timestamps: true,
  }
);

studentSubjectSchema.index(
  {
    studentId: 1,
    subjectId: 1,
  },
  {
    unique: true,
  }
);

module.exports =mongoose.models.StudentSubject || mongoose.model(
  "StudentSubject",
  studentSubjectSchema
);