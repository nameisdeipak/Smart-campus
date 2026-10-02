const mongoose = require("mongoose");
const hostelSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },

    hostelName: String,
    roomNumber: String,
    bedNumber: String,

    status: {
      type: String,
      enum: ["allocated", "vacant"]
    }
  },
  {
    timestamps: true
  }
);