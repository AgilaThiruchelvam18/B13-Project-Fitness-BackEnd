const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const Class = require("../models/Class");

// ✅ Create a new booking
exports.createBooking = async (req, res) => {
  try {
    console.log("🔹 Booking Request Received:", req.body); // Log the request body

    const { classId, trainerId, category, price } = req.body;

    if (!classId || !trainerId || !category || !price) {
      console.log("❌ Missing Fields:", { classId, trainerId, category, price });
      return res.status(400).json({ message: "All fields are required" });
    }

    // Proceed with booking creation
    const newBooking = new Booking({
      user: req.user._id, // Assuming `protectCustomer` middleware sets req.user
      classId,
      trainer: trainerId,
      category,
      price,
      status: "Booked",
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ trainer: req.user._id }).populate("user", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
