const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    branchCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
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

branchSchema.index(
  {
    courseId: 1,
    branchCode: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.models.Branch || mongoose.model(
  "Branch",
  branchSchema
);