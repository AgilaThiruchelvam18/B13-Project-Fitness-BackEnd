const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const Class = require("../models/Class");

// ✅ Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { classId } = req.body; // Get class ID from request body

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // 🔥 Validate if the class exists
    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 🔥 Prevent booking past classes
    if (new Date(selectedClass.date) < new Date()) {
      return res.status(400).json({ message: "You cannot book a past class!" });
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
      status: "Booked", // Default status
    });

    await newBooking.save();

    res.status(201).json({ message: "Booking successful!", booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Failed to book class", error: error.message });
  }
};

// ✅ Get all bookings for logged-in user
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const bookings = await Booking.find({ user: req.user._id })
      .populate("classId", "title category duration")
      .populate("trainer", "name expertise");

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// ✅ Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("classId", "title category duration")
      .populate("trainer", "name expertise");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Error fetching booking", error: err.message });
  }
};

// ✅ Update booking (Reschedule)
exports.updateBooking = async (req, res) => {
  try {
    const { classId } = req.body;

    // 🔥 Check if the new class exists
    const newClass = await Class.findById(classId);
    if (!newClass) {
      return res.status(404).json({ message: "New class not found" });
    }

    // 🔥 Prevent rescheduling to past classes
    if (new Date(newClass.date) < new Date()) {
      return res.status(400).json({ message: "Cannot reschedule to a past class!" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { classId }, { new: true })
      .populate("classId", "title category duration");

    res.json({ message: "Booking updated successfully!", updatedBooking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Error updating booking", error: err.message });
  }
};

// ✅ Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking cancelled successfully!" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ message: "Error cancelling booking", error: err.message });
  }
};
