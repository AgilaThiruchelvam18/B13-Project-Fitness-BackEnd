const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create an Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // Razorpay accepts paise
      currency: "INR",
      receipt: `order_rcptid_${bookingId}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Save order details in DB
    const payment = new Payment({
      userId: req.user.id,
      bookingId,
      razorpayOrderId: order.id,
      amount,
      status: "Pending",
    });

    await payment.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// ✅ Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Signature verification (optional but recommended)
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid Signature" });
  }

  // Update Payment Status
  await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    { razorpayPaymentId: razorpay_payment_id, status: "Paid" },
    { new: true }
  );

  res.json({ success: true, message: "Payment Successful" });
};
