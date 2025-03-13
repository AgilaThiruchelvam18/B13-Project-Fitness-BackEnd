const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const Class = require("../models/Class");
const { generateRecommendations } = require("./recommendationController");

// ✅ Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { classId, trainerId, category, price } = req.body;
    console.log("Trainer ID Received:", trainerId);

    // ✅ Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Validate input fields
    if (!classId || !trainerId || !category || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check if class exists
    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ✅ Check if trainer exists
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    console.log("Trainer details:", trainer);

    // ✅ Prevent duplicate bookings
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      class: classId, // ✅ Use 'class' instead of 'classId' to match schema
      status: "Booked",
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this class" });
    }

    // ✅ Create new booking
    const newBooking = new Booking({
      user: req.user._id,
      class: classId,
      trainer: trainerId,
      category,
      price,
      status: "Booked",
    });

    await newBooking.save();

    // ✅ Instead of making an axios call, trigger recommendations function directly
    await generateRecommendations(req, res); 

    res.status(201).json({ message: "Booking successful", booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
    .populate("user", "userName email") // ✅ Populating user
    .populate("trainer", "userName email ratings")
    .populate("classId")// ✅ Populating trainer
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//    populate("trainer", "userName email ratings");

// 🔥 Update Booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // Booking ID

    // 🔍 Find booking by ID
    let booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔐 Ensure only the user who booked it can cancel
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // ✅ Update the status to "Cancelled"
    booking.status = "Cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
