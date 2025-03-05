const Review = require("../models/Review");
const Trainer = require("../models/Trainer");

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { user, trainer, rating, comment } = req.body;
    const newReview = new Review({ user, trainer, rating, comment });
    await newReview.save();

    // Update trainer's rating
    const reviews = await Review.find({ trainer });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Trainer.findByIdAndUpdate(trainer, {
      "ratings.averageRating": avgRating,
      "ratings.totalReviews": reviews.length,
    });

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: "Error creating review", error: err.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user trainer", "name");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
};

// Get reviews for a specific trainer
exports.getReviewsByTrainer = async (req, res) => {
  try {
    const reviews = await Review.find({ trainer: req.params.trainerId }).populate("user", "name");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trainer reviews", error: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: "Error updating review", error: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting review", error: err.message });
  }
};
