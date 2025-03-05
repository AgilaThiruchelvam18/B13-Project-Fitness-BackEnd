const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  classType: { type: String, required: true }, // e.g., "Yoga", "Cardio"
  date: { type: Date, required: true },
  status: { type: String, enum: ["Booked", "Canceled", "Completed"], default: "Booked" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
