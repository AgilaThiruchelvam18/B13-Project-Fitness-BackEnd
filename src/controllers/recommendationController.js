const Recommendation = require("../models/Recommendation");
const Booking = require("../models/Booking");
const Class = require("../models/Class");

exports.generateRecommendations = async (userId) => {
  try {
    // Fetch user's past bookings
    const bookings = await Booking.find({ user: userId }).populate("classId").populate("trainer");

    if (!bookings.length) {
      return;
    }

    // Extract unique class categories
    const classCategories = [...new Set(bookings.map(b => b.classId.category))];

    if (!classCategories.length) {
      return;
    }

    // Find recommended classes
    const recommendedClasses = await Class.find({ category: { $in: classCategories } }).populate("trainer").limit(5);

    // Save/update recommendations in the database
    await Recommendation.findOneAndUpdate(
      { user: userId },
      { recommendedClasses },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Error generating recommendations:", err);
  }
};

// Get recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.findOne({ user: req.params.userId })
      .populate("recommendedClasses");

    if (!recommendations) {
      // ✅ Instead of error, return empty recommendations
      return res.status(200).json({ message: "No recommendations yet", recommendations: [] });
    }

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recommendations", error: err.message });
  }
};
