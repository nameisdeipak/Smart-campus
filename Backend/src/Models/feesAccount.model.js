import mongoose from "mongoose";

const feeAccountSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    totalFee: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["paid", "partial", "due", "overdue"],
      default: "due",
    },
  },
  {
    timestamps: true,
  }
);

const FeeAccount = mongoose.model("feeAccounts", feeAccountSchema);

export default FeeAccount;