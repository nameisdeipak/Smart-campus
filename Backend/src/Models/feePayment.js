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
        "Razorpay",
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

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
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

feePaymentSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayOrderId: { $type: "string" } },
  }
);

feePaymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayPaymentId: { $type: "string" } },
  }
);

feePaymentSchema.index(
  { studentFeeId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "Pending",
      paymentMethod: "Razorpay",
    },
  }
);

module.exports = mongoose.models.FeePayment || mongoose.model("FeePayment", feePaymentSchema);