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
    console.log("📩 Received Payment Request:", req.body);

    const { amount, bookingId, userId } = req.body;

    if (!amount || !bookingId || !userId) {
      console.error("❌ Missing Fields:", { amount, bookingId, userId });
      return res.status(400).json({ success: false, message: "Amount, Booking ID, and User ID are required" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: bookingId,
    };

    console.log("🛠️ Creating Razorpay Order with:", options);

    // 🔹 CREATE ORDER (Catch errors from Razorpay)
    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log("✅ Razorpay Order Created:", order);
    } catch (razorpayError) {
      console.error("❌ Razorpay Error:", razorpayError);
      return res.status(500).json({
        success: false,
        message: "Error creating Razorpay order",
        error: razorpayError.message || razorpayError,
      });
    }

    // 🔹 SAVE TO DATABASE (Catch errors from Mongoose)
    try {
      const newPayment = new Payment({
        userId,
        bookingId,
        razorpayOrderId: order.id,
        amount,
        status: "Pending",
      });

      await newPayment.save();
      console.log("✅ Payment Saved to Database:", newPayment);
    } catch (dbError) {
      console.error("❌ Database Error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error saving payment data",
        error: dbError.message || dbError,
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("❌ Unknown Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment order",
      error: error.message || error,
    });
  }
};


// ✅ Verify Razorpay Payment
router.post("/verify", async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, bookingId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !bookingId) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, status: "Paid" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    res.json({ success: true, message: "Payment verified successfully", payment });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

