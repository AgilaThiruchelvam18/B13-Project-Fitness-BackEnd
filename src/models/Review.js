const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who gives the review
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true }, // Trainer being reviewed
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, // Associated booking
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating (1-5)
    comment: { type: String, required: true }, // Review text
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
