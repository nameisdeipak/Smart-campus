const mongoose = require("mongoose"); 
const transportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },

    routeName: String,
    busNumber: String,
    pickupPoint: String,
    driverName: String,

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);