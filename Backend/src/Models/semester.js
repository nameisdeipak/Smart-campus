const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
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

    semesterNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    semesterName: {
      type: String,
      required: true,
      trim: true,
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

semesterSchema.index(
  {
    branchId: 1,
    semesterNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.models.Semester || mongoose.model("Semester", semesterSchema);