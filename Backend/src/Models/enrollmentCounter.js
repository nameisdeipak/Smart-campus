const mongoose = require("mongoose");

const enrollmentCounterSchema = new mongoose.Schema(
  {
    courseKey: {
      type: String,
      required: true,
      trim: true,
    },

    branchKey: {
      type: String,
      required: true,
      trim: true,
    },

    admissionYear: {
      type: Number,
      required: true,
    },

    sequence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

enrollmentCounterSchema.index(
  {
    courseKey: 1,
    branchKey: 1,
    admissionYear: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "EnrollmentCounter",
  enrollmentCounterSchema
);