const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

  enrollmentNumber: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},



    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String
    },

    course: {
      type: String,
      required: true
    },

    branch: {
      type: String,
      required: true
    },

    semester: {
      type: Number,
      required: true
    },

    section: {
      type: String
    },

    admissionYear: {
      type: Number
    },
       address: {
      type: String,
      trim: true,
    },

  },
  {
    timestamps: true
  }
);

// module.exports = mongoose.model("Student", studentSchema);
// student.js
module.exports =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);