const Review = require("../models/Review");
const Booking = require("../models/Booking");
// 

// ✅ Get all reviews for a logged-in user
// exports.getReviews = async (req, res) => {
//   try {
//     const reviews = await Review.find({ userId: req.user._id });
//     res.status(200).json(reviews);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching reviews", error });
//   }
// };
exports.createReview = async (req, res) => {
  try {
    const { trainerId, bookingId, rating, comment } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    // Check if the trainer exists
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    // Create a new review
    const newReview = new Review({
      user: userId,
      trainer: trainerId,
      booking: bookingId,
      rating,
      comment,
    });

    await newReview.save();

    // Push review to trainer's reviews array
    trainer.reviews.push(newReview);
    trainer.ratings.totalReviews += 1;
    trainer.ratings.averageRating =
      (trainer.ratings.averageRating * (trainer.ratings.totalReviews - 1) +
        rating) /
      trainer.ratings.totalReviews;

    await trainer.save();

    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
