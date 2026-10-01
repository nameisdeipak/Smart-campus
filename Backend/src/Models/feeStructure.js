const mongoose = require("mongoose");

const feeItemSchema = new mongoose.Schema(
  {
    feeType: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
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

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    feeItems: {
      type: [feeItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one fee item is required",
      },
    },

    totalAmount: {
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

feeStructureSchema.index(
  {
    courseId: 1,
    branchId: 1,
    semesterId: 1,
    academicYear: 1,
  },
  {
    unique: true,
  }
);

module.exports =mongoose.models.FeeStructure || mongoose.model("FeeStructure", feeStructureSchema);