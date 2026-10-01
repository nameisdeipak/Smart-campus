const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },

    date: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);