const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const Class = require("../models/Class");

// ✅ Create a new booking
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ trainer: req.user.id }).populate("user", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
