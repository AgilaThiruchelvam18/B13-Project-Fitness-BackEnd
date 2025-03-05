const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
