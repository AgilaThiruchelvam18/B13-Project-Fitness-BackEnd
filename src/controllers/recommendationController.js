const Recommendation = require("../models/Recommendation");
const Booking = require("../models/Booking");
const Class = require("../models/Class");

exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user's past bookings
    const bookings = await Booking.find({ user: userId }).populate("trainer");

    if (!bookings.length) return res.status(404).json({ message: "No past bookings found" });

    // Extract unique class types from past bookings
    const classTypes = [...new Set(bookings.map(b => b.class))];

    // Find trainers offering similar class types
    const recommendedTrainers = await Trainer.find({ expertise: { $in: classTypes } });

    const recommendation = await Recommendation.findOneAndUpdate(
      { user: userId },
      { recommendedTrainers },
      { upsert: true, new: true }
    );

    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ message: "Error generating recommendations", error: err.message });
  }
};

// Get recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.findOne({ user: req.params.userId }).populate("recommendedClasses");
    if (!recommendations) return res.status(404).json({ message: "No recommendations found" });
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recommendations", error: err.message });
  }
};
