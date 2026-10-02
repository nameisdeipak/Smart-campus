const crypto = require("crypto");

const FeePayment = require("../Models/feePayment");
const Student = require("../Models/student");
const StudentFee = require("../Models/studentFee");
const { getRazorpayClient } = require("../Services/razorpayService");

const getStudentForRequest = async (userId) => {
  const student = await Student.findOne({ userId });

  if (!student) {
    const error = new Error("Student profile not found");
    error.statusCode = 404;
    throw error;
  }

  return student;
};

const createFeeOrder = async (req, res) => {
  try {
    const student = await getStudentForRequest(req.user._id);
    const studentFee = await StudentFee.findOne({
      _id: req.params.studentFeeId,
      studentId: student._id,
      isActive: true,
    });

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const amountInPaise = Math.round(Number(studentFee.dueAmount) * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "There is no valid fee amount due for this record",
      });
    }

    const recentPendingOrder = await FeePayment.findOne({
      studentFeeId: studentFee._id,
      status: "Pending",
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (recentPendingOrder) {
      return res.status(409).json({
        success: false,
        message:
          "A payment is already in progress for this fee. Finish or close that checkout first.",
      });
    }

    await FeePayment.updateMany(
      {
        studentFeeId: studentFee._id,
        status: "Pending",
        createdAt: { $lte: new Date(Date.now() - 30 * 60 * 1000) },
      },
      {
        $set: {
          status: "Failed",
          remarks: "Payment order expired before checkout completed",
        },
      }
    );

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `fee_${String(studentFee._id).slice(-16)}_${Date.now()}`,
      notes: {
        studentFeeId: String(studentFee._id),
        studentId: String(student._id),
      },
    });

    await FeePayment.create({
      studentFeeId: studentFee._id,
      studentId: student._id,
      amount: amountInPaise / 100,
      paymentMethod: "Razorpay",
      transactionId: order.id,
      razorpayOrderId: order.id,
      paymentDate: new Date(),
      receiptNumber: `RZP-${order.id}`,
      status: "Pending",
      remarks: "Razorpay order created; payment not yet verified",
    });

    return res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_API_KEY,
      order,
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone || "",
      },
    });
  } catch (error) {
    console.error("Create Razorpay Fee Order Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A payment is already in progress for this fee. Finish or close that checkout first.",
      });
    }
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to start fee payment",
    });
  }
};

const verifyFeePayment = async (req, res) => {
  let updatedFee;
  let pendingPayment;
  let feeBeforePayment;
  let student;

  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment verification details are required",
      });
    }

    const razorpay = getRazorpayClient();
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest();
    const receivedSignature = Buffer.from(signature, "hex");

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment signature is invalid",
      });
    }

    student = await getStudentForRequest(req.user._id);
    const feePayment = await FeePayment.findOne({
      razorpayOrderId: orderId,
      studentId: student._id,
    });

    if (!feePayment) {
      return res.status(404).json({
        success: false,
        message: "Payment order was not found for this student",
      });
    }

    if (feePayment.status === "Success") {
      if (feePayment.razorpayPaymentId !== paymentId) {
        return res.status(409).json({
          success: false,
          message: "This order has already been completed with another payment",
        });
      }

      const fee = await StudentFee.findOne({
        _id: feePayment.studentFeeId,
        studentId: student._id,
      });
      return res.json({ success: true, fee, payment: feePayment });
    }

    if (feePayment.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "This payment order is no longer active",
      });
    }

    const [order, capturedPayment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);
    const expectedAmountInPaise = Math.round(Number(feePayment.amount) * 100);

    if (
      order.id !== orderId ||
      order.status !== "paid" ||
      order.amount !== expectedAmountInPaise ||
      order.currency !== "INR" ||
      String(order.notes?.studentId) !== String(student._id) ||
      String(order.notes?.studentFeeId) !== String(feePayment.studentFeeId) ||
      capturedPayment.order_id !== orderId ||
      capturedPayment.amount !== expectedAmountInPaise ||
      capturedPayment.currency !== "INR" ||
      capturedPayment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay has not confirmed a captured payment for this fee",
      });
    }

    pendingPayment = feePayment;
    feeBeforePayment = await StudentFee.findOne({
      _id: feePayment.studentFeeId,
      studentId: student._id,
      isActive: true,
    });

    if (!feeBeforePayment || Number(feeBeforePayment.dueAmount) !== feePayment.amount) {
      return res.status(409).json({
        success: false,
        message: "The fee balance changed. Contact the administrator to reconcile this payment.",
      });
    }

    updatedFee = await StudentFee.findOneAndUpdate(
      {
        _id: feeBeforePayment._id,
        studentId: student._id,
        isActive: true,
        paidAmount: feeBeforePayment.paidAmount,
        dueAmount: feeBeforePayment.dueAmount,
      },
      {
        $inc: { paidAmount: feePayment.amount },
        $set: { dueAmount: 0, status: "Paid" },
      },
      { new: true, runValidators: true }
    );

    if (!updatedFee) {
      return res.status(409).json({
        success: false,
        message: "The fee balance was updated already. Refresh the page.",
      });
    }

    const completedPayment = await FeePayment.findOneAndUpdate(
      { _id: feePayment._id, status: "Pending" },
      {
        $set: {
          razorpayPaymentId: paymentId,
          transactionId: paymentId,
          receiptNumber: `RZP-${paymentId}`,
          paymentDate: new Date(capturedPayment.created_at * 1000),
          status: "Success",
          remarks: "Razorpay payment captured and signature verified",
        },
      },
      { new: true, runValidators: true }
    );

    if (!completedPayment) {
      const rolledBackFee = await StudentFee.findOneAndUpdate(
        {
          _id: updatedFee._id,
          studentId: student._id,
          paidAmount: updatedFee.paidAmount,
          dueAmount: 0,
        },
        {
          $set: {
            paidAmount: feeBeforePayment.paidAmount,
            dueAmount: feeBeforePayment.dueAmount,
            status: feeBeforePayment.status,
          },
        },
        { new: true }
      );

      if (!rolledBackFee) {
        console.error(
          "Razorpay payment record could not be completed and fee balance rollback failed",
          { orderId, paymentId }
        );
        return res.status(500).json({
          success: false,
          message:
            "Payment was captured, but the fee update needs administrator reconciliation.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Payment verification was already processed. Refresh the page.",
      });
    }

    return res.json({
      success: true,
      message: "Fee payment verified successfully",
      fee: updatedFee,
      payment: completedPayment,
    });
  } catch (error) {
    if (updatedFee && pendingPayment && student && feeBeforePayment) {
      const rollback = await StudentFee.findOneAndUpdate(
        {
          _id: updatedFee._id,
          studentId: student._id,
          paidAmount: updatedFee.paidAmount,
          dueAmount: 0,
        },
        {
          $set: {
            paidAmount: feeBeforePayment.paidAmount,
            dueAmount: feeBeforePayment.dueAmount,
            status: feeBeforePayment.status,
          },
        },
        { new: true }
      );

      if (!rollback) {
        console.error(
          "Razorpay verification failed and fee balance rollback failed",
          { orderId: pendingPayment.razorpayOrderId, error }
        );
      }
    }

    console.error("Verify Razorpay Fee Payment Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to verify Razorpay payment",
    });
  }
};

const cancelFeeOrder = async (req, res) => {
  try {
    const student = await getStudentForRequest(req.user._id);
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID is required",
      });
    }

    await FeePayment.findOneAndUpdate(
      {
        razorpayOrderId: orderId,
        studentId: student._id,
        status: "Pending",
      },
      {
        $set: {
          status: "Failed",
          remarks: "Checkout was dismissed before payment verification",
        },
      }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Cancel Razorpay Fee Order Error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update payment order",
    });
  }
};

module.exports = {
  createFeeOrder,
  verifyFeePayment,
  cancelFeeOrder,
};
