const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // Link to the Class model
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
    category: { type: String, required: true }, // Yoga, Cardio, etc.
    price: { type: Number, required: true }, // Price of the class
    status: { type: String, enum: ["Booked", "Cancelled", "Completed"], default: "Booked" }, // Booking status
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);


// paymentStatus: {
//   type: String,
//   enum: ["Pending", "Paid", "Failed"],
//   default: "Pending",
// },
// scheduleDate: {
//   type: Date, // Scheduled class date
//   required: true,
// },