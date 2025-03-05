const Payment = require("../models/Payment");
const sendEmail = require("../utils/emailService");
const User = require("../models/User");
exports.processPayment = async (req, res) => {
  try {
    const { userId, amount, paymentMethod, transactionId } = req.body;

    const payment = new Payment({
      user: userId,
      amount,
      transactionId,
      status: "Completed",
    });

    await payment.save();

    // Fetch user email
    const user = await User.findById(userId);

    // Send payment receipt email
    await sendEmail(
      user.email,
      "Payment Receipt - Fitness Booking",
      `<p>Dear ${user.name},</p>
      <p>Thank you for your payment of <strong>$${amount}</strong> for your fitness class.</p>
      <p>Payment Method: ${paymentMethod}</p>
      <p>Transaction ID: ${transactionId}</p>
      <p>Receipt: <strong>PAID</strong></p>
      <p>We appreciate your business!</p>`
    );

    res.status(201).json({ message: "Payment successful, receipt sent." });
  } catch (error) {
    res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
};


// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user booking");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user booking");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payment", error: err.message });
  }
};
