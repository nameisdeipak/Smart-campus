const mongoose = require("mongoose");

const subjectFacultyAssignmentSchema =
  new mongoose.Schema(
    {
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },

      facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true,
      },

      section: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },

      academicYear: {
        type: String,
        required: true,
        trim: true,
      },

      assignmentStatus: {
        type: String,
        enum: ["Assigned", "Inactive"],
        default: "Assigned",
      },

      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

subjectFacultyAssignmentSchema.index(
  {
    subjectId: 1,
    facultyId: 1,
    section: 1,
    academicYear: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "SubjectFacultyAssignment",
    subjectFacultyAssignmentSchema
  );