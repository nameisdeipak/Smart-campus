const mongoose = require("mongoose");

const feePaymentSchema = new mongoose.Schema(
  {
    studentFeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash",
        "UPI",
        "Card",
        "Net Banking",
        "Bank Transfer",
        "Cheque",
      ],
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Success", "Pending", "Failed", "Refunded"],
      default: "Success",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.FeePayment || mongoose.model("FeePayment", feePaymentSchema);