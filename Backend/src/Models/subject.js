const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    subjectName: {
      type: String,
      required: true,
      trim: true,
    },

    subjectType: {
      type: String,
      required: true,
      enum: [
        "Core",
        "Elective",
        "Practical",
        "Lab",
        "Project",
        "Training",
      ],
      default: "Core",
    },

    credits: {
      type: Number,
      required: true,
      min: 0,
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index(
  {
    semesterId: 1,
    subjectCode: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.models.Subject ||mongoose.model(
  "Subject",
  subjectSchema
);