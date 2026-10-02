const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherPhone: {
      type: String,
      required: true,
      trim: true,
    },

    fatherEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    fatherOccupation: {
      type: String,
      trim: true,
      default: "",
    },

    motherName: {
      type: String,
      required: true,
      trim: true,
    },

    motherPhone: {
      type: String,
      required: true,
      trim: true,
    },

    motherEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    motherOccupation: {
      type: String,
      trim: true,
      default: "",
    },

    guardianName: {
      type: String,
      trim: true,
      default: "",
    },

    guardianPhone: {
      type: String,
      trim: true,
      default: "",
    },

    guardianRelation: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
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

module.exports =mongoose.models.Parent || mongoose.model("Parent", parentSchema);