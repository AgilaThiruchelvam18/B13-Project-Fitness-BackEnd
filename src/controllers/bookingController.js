const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");

// Book a class
const Booking = require("../models/Booking");
const Class = require("../models/Class");

exports.createBooking = async (req, res) => {
  try {
    const { classId } = req.body; // Get class ID from request body

    // 🔥 Validate if the class exists
    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 🔥 Check if the user has already booked this class
    const existingBooking = await Booking.findOne({ user: req.user._id, classId });
    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this class!" });
    }

    // 🔥 Check if class has available spots
    const bookedCount = await Booking.countDocuments({ classId });
    if (bookedCount >= selectedClass.capacity) {
      return res.status(400).json({ message: "Class is fully booked!" });
    }

    // 🔥 Create a new booking
    const newBooking = new Booking({
      user: req.user._id,
      classId: selectedClass._id,
      trainer: selectedClass.trainer,
      category: selectedClass.category,
      duration: selectedClass.duration,
      price: selectedClass.price,
    });

    await newBooking.save();

    res.status(201).json({ message: "Booking successful!", booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Failed to book class", error: error.message });
  }
};


// Get all bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }); // 👈 Fetch only logged-in user's bookings
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("user classType");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

// Update booking (Reschedule)
exports.updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const cancelledBooking = await Booking.findByIdAndUpdate(req.params.id, { status: "Cancelled" }, { new: true });
    res.json(cancelledBooking);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};
