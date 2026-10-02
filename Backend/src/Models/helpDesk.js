const mongoose = require("mongoose");

const helpDeskSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
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
      ],
      default: "Other",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },

    response: {
      type: String,
      trim: true,
      default: "",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
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

helpDeskSchema.index({ studentId: 1 });
helpDeskSchema.index({ status: 1 });
helpDeskSchema.index({ category: 1 });
helpDeskSchema.index({ priority: 1 });

module.exports = mongoose.model("HelpDesk", helpDeskSchema);