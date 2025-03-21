const Review = require("../models/Review");
const Booking = require("../models/Booking");
// 
// ✅ Submit a Review
const Review = require("../models/reviewModel");
const Booking = require("../models/bookingModel");

// ✅ Get all reviews for a logged-in user
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};
exports.createReview = async (req, res) => {
  try {
    const { trainerId, bookingId, rating, comment } = req.body;
    const userId = req.user._id; // Extract user ID from token

    if (!trainerId) return res.status(400).json({ message: "Trainer ID is required" });

    // Check if booking exists and is completed
    const booking = await Booking.findOne({ _id: bookingId, user: userId, status: "Completed" });
    if (!booking) return res.status(400).json({ message: "Invalid booking or class not completed" });

    // Check if review already exists
    const existingReview = await Review.findOne({ user: userId, booking: bookingId });
    if (existingReview) return res.status(400).json({ message: "Review already submitted" });

    const review = new Review({ user: userId, trainer: trainerId, booking: bookingId, rating, comment });
    await review.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ Fetch Reviews for a Trainer
exports.getTrainerReviews = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const reviews = await Review.find({ trainer: trainerId }).populate("user", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Trainer Respond to a Review
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.response = response;
    await review.save();

    res.json({ message: "Response added", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
