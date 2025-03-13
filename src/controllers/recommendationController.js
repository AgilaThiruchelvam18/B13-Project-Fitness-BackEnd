const Recommendation = require("../models/Recommendation");
const Booking = require("../models/Booking");
const Class = require("../models/Class");

exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user's past bookings and populate class details
    const bookings = await Booking.find({ user: userId }).populate("classId");

    // ✅ Fix: Instead of returning an error, allow empty recommendations
    if (!bookings.length) {
      console.log("No past bookings found. Returning empty recommendations.");
      return res.status(200).json({ message: "No past bookings found", recommendations: [] });
    }

    // Extract unique class categories from past bookings
    const classCategories = [...new Set(bookings.map(b => b.classId.category))];

    if (!classCategories.length) {
      return res.status(200).json({ message: "No class categories found from past bookings", recommendations: [] });
    }

    // Find classes that match user's interests
    const recommendedClasses = await Class.find({ category: { $in: classCategories } }).limit(10);

    res.status(200).json({ recommendations: recommendedClasses });
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ message: "Error generating recommendations", error: err.message });
  }
};


// Get recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.findOne({ user: req.params.userId })
      .populate("recommendedClasses");

    console.log("Recommendations found:", recommendations); // ✅ Debugging log

    if (!recommendations) {
      return res.status(404).json({ message: "No recommendations found" });
    }

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recommendations", error: err.message });
  }
};
