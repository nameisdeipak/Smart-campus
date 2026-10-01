const mongoose = require("mongoose");
const marksSchema = new mongoose.Schema(
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

    internalMarks: {
      type: Number,
      default: 0
    },

    assignmentScore: {
      type: Number,
      default: 0
    },

    previousMarks: {
      type: Number,
      default: 0
    },

    semester: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Marks ||
  mongoose.model("Marks", marksSchema);