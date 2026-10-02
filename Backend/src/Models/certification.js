const mongoose = require("mongoose");
const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    certificateType: {
      type: String,
      enum: [
        "bonafide",
        "transfer",
        "character",
        "degree",
        "marksheet"
      ]
    },

    status: {
      type: String,
      enum: ["requested", "approved", "issued"],
      default: "requested"
    },

    certificateUrl: String,

    issuedAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Certificate",
  certificateSchema
);