const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // Link to the Class model
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
    category: { type: String, required: true }, // Yoga, Cardio, etc.
    price: { type: Number, required: true }, // Price of the class
    status: { type: String, enum: ["Booked", "Cancelled", "Completed"], default: "Booked" }, // Booking status
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
