const Razorpay = require("razorpay");

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_API_KEY;
  const keySecret = process.env.RAZORPAY_API_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error(
      "Razorpay is not configured. Set RAZORPAY_API_KEY and RAZORPAY_API_SECRET in Backend/.env."
    );
    error.statusCode = 503;
    throw error;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

module.exports = { getRazorpayClient };
