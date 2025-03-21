const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create an Order
exports.createOrder = async (req, res) => { // 🟢 Added 'async' here
  try {
      console.log("🔹 Received Payment Request:", req.body); 

      const { amount, bookingId, userId } = req.body;

      if (!amount || !bookingId || !userId) {
          console.error("❌ Missing required fields:", { amount, bookingId, userId });
          return res.status(400).json({ success: false, message: "Amount, Booking ID, and User ID are required" });
      }

      const options = {
          amount: amount * 100, // Convert amount to paise (Razorpay requires it)
          currency: "INR",
          receipt: bookingId,
      };

      console.log("🟢 Creating Razorpay Order with options:", options);

      // 🟢 Create order with Razorpay
      const order = await razorpay.orders.create(options); // ✅ 'await' now works inside async function

      if (!order || !order.id) {
          console.error("❌ Razorpay Order Creation Failed, Order Response:", order);
          return res.status(500).json({ success: false, message: "Failed to create order with Razorpay" });
      }

      console.log("✅ Razorpay Order Created Successfully:", order);

      // 🟢 Save payment in DB with "Pending" status
      const newPayment = new Payment({
          userId,
          bookingId,
          razorpayOrderId: order.id,
          amount,
          status: "Pending",
      });

      console.log("🟢 Saving Payment to DB:", newPayment);

      await newPayment.save();

      console.log("✅ Payment Successfully Saved in DB");

      res.json({ success: true, order });
  } catch (error) {
      console.error("❌ Error creating order:", error);
      res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};



// ✅ Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
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
};

