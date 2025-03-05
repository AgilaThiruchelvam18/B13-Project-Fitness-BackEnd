const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");

// Book a class
exports.createBooking = async (req, res) => {

    try {
      const { userId, trainerId, classType, date, time } = req.body;
  
      // Create booking in database
      const booking = new Booking({
        user: userId,
        trainer: trainerId,
        classType,
        date,
        time,
      });
  
      await booking.save();
  
      // Fetch user email
      const user = await User.findById(userId);
      const trainer = await Trainer.findById(trainerId);
  
      // Send confirmation email
      await sendEmail(
        user.email,
        "Booking Confirmation - Fitness Class",
        `<p>Dear ${user.name},</p>
        <p>Your fitness class with <strong>${trainer.name}</strong> has been successfully booked.</p>
        <p>Class: ${classType}</p>
        <p>Date: ${date}, Time: ${time}</p>
        <p>We look forward to seeing you!</p>`
      );
  
      res.status(201).json({ message: "Booking confirmed, email sent." });
    } 
  catch (err) {
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user classType");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
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
