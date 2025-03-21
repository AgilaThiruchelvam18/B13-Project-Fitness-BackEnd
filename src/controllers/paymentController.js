const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🛒 Create Order API
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", bookingId } = req.body;

    const options = {
      amount: amount * 100, // Razorpay works with paise (multiply by 100)
      currency,
      receipt: `receipt_${bookingId}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({ success: true, order, bookingId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Error creating payment order" });
  }
};

// ✅ Verify Payment API
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Update booking as paid in DB (modify according to your schema)
    await Booking.findByIdAndUpdate(bookingId, { status: "Paid" });

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};
