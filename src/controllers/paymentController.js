const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Order
exports.createOrder = async (req, res) => {
  try {
    console.log("Received Payment Request:", req.body);

    const { amount, bookingId, userId } = req.body;
    if (!amount || !bookingId || !userId) {
      return res.status(400).json({ success: false, message: "Amount, Booking ID, and User ID are required" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${bookingId}`,
      payment_capture: 1, // Auto capture payment
    };

    console.log("Creating Razorpay Order...");
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create order" });
    }

    console.log("Razorpay Order Created:", order);

    const newPayment = new Payment({
      userId,
      bookingId,
      razorpayOrderId: order.id,
      amount,
      status: "Pending",
    });

    await newPayment.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, bookingId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !bookingId) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    console.log("🔍 Verifying Payment:", req.body);

    // Check if payment exists
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    // Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = "Paid";
    await payment.save();

    // Update booking status to confirmed
    await Booking.findByIdAndUpdate(bookingId, { status: "Confirmed" });

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
