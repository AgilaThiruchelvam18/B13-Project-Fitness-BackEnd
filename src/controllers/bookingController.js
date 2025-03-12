const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const Class = require("../models/Class");

// ✅ Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { classId, trainerId, category, price } = req.body;
    console.log("Trainer ID Received:", trainerId);

    // ✅ FIX: Ensure all required fields are provided
    if (!classId || !trainerId || !category || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ FIX: Check if class exists
    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // ✅ FIX: Check if trainer exists (trainerId is already a string)
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    console.log("Trainer details:", trainer);

    // ✅ FIX: Prevent duplicate bookings
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      classId,
      status: "Booked",
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this class" });
    }

    // ✅ FIX: Create new booking with correct trainer reference
    const newBooking = new Booking({
      user: req.user._id, 
      classId,
      trainer: trainerId, // ✅ FIXED: Using trainerId directly
      category,
      price,
      status: "Booked",
    });

    await newBooking.save();

    res.status(201).json({ message: "Booking successful", booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
