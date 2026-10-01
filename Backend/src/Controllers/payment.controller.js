import crypto from "crypto";

import { paymentInstance } from "../services/payment.service.js";

import FeeAccount from "../models/feesAccount.model.js";

import FeePayment from "../models/feesPayment.model.js";

const payProcess = async (req, res) => {
  try {
    const { amount } = req.body;

    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const feeAccount = await FeeAccount.findOne({
      clerkId: userId,
    });

    if (!feeAccount) {
      return res.status(404).json({
        success: false,
        message: "Fee account not found",
      });
    }

    const paymentAmount = Math.min(
      Number(amount),
      feeAccount.dueAmount
    );

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "No fee due",
      });
    }

    const options = {
      amount: paymentAmount * 100,
      currency: "INR",
    };

    const order = await paymentInstance.orders.create(options);

    // Save payment record
    await FeePayment.create({
      clerkId: userId,
      amount: paymentAmount,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Payment Process Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

const getKey = (req, res) => {
  const key = process.env.RAZORPAY_API_KEY;

  return res.status(200).json({
    success: true,
    key,
  });
};

const getMyFees = async (req, res) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log(userId);

    const feeAccount = await FeeAccount.findOne({
      clerkId: userId,
    });

    console.log(feeAccount);

    if (!feeAccount) {
      return res.status(404).json({
        success: false,
        message: "Fee account not found",
      });
    }

    return res.status(200).json({
      success: true,
      feeAccount,
    });
  } catch (error) {
    console.error("Get Fee Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee details",
    });
  }
};

const paymentVarification = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    console.log(req.body);

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_API_SECRET
      )
      .update(body)
      .digest("hex");

    // Signature verification
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Find payment record
    const payment = await FeePayment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Prevent duplicate payment update
    if (payment.status === "paid") {
      return res.redirect(
        `http://localhost:5173/fees/paymentDone?reference=${razorpay_payment_id}`
      );
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";
    payment.paymentDate = new Date();

    await payment.save();

    // Find student's fee account
    const feeAccount = await FeeAccount.findOne({
      clerkId: payment.clerkId,
    });

    if (!feeAccount) {
      return res.status(404).json({
        success: false,
        message: "Fee account not found",
      });
    }

    // Update fee amounts
    feeAccount.paidAmount += payment.amount;

    feeAccount.dueAmount = Math.max(
      0,
      feeAccount.totalFee - feeAccount.paidAmount
    );

    // Update status
    if (feeAccount.dueAmount === 0) {
      feeAccount.status = "paid";
    } else {
      feeAccount.status = "partial";
    }

    await feeAccount.save();

    console.log("Fee account updated:", feeAccount);

    return res.redirect(
      `http://localhost:5173/fees/paymentDone?reference=${razorpay_payment_id}`
    );
  } catch (error) {
    console.error("Payment Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

export const paymentController = {
  payProcess,
  getKey,
  getMyFees,
  paymentVarification,
};