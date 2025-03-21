const Booking = require("../models/Booking");
const Trainer = require("../models/Trainer");
const User = require("../models/User");
const { generateRecommendations } = require("./recommendationController");
const Class = require("../models/Class");
const nodemailer = require("nodemailer");

// ✅ Configure Nodemailer for email notifications
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Use App Password if using Gmail
  },
});

// ✅ Create a new booking with email notification
exports.createBooking = async (req, res) => {
  try {
    const { classId, trainerId, category, price } = req.body;

    if (!classId || !trainerId || !category || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const selectedClass = await Class.findById(classId);
    if (!selectedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      classId,
      status: "Booked",
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You have already booked this class" });
    }

    // ✅ Create new booking
    const newBooking = new Booking({
      user: req.user._id,
      classId,
      trainer: trainerId,
      category,
      price,
      status: "Booked",
    });

    await newBooking.save();
    await generateRecommendations(req.user._id);

    // ✅ Send booking confirmation email
    const user = await User.findById(req.user._id);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Booking Confirmation - Fitness Hub",
      html: `
        <h2>Booking Confirmed! 🎉</h2>
        <p>Hi ${user.userName},</p>
        <p>Your booking for <strong>${selectedClass.title}</strong> with trainer <strong>${trainer.userName}</strong> has been confirmed.</p>
        <p><strong>Category:</strong> ${selectedClass.category}</p>
        <p><strong>Duration:</strong> ${selectedClass.duration} mins</p>
        <p><strong>Price:</strong> $${selectedClass.price}</p>
        <p>See you soon! 💪</p>
        <br />
        <p>Best Regards,<br />Fitness Hub Team</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ message: "Booking successful. Confirmation email sent.", booking: newBooking });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("user", "userName email")
      .populate("trainer", "userName email ratings")
      .populate("classId");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Cancel booking with email notification
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let booking = await Booking.findById(id).populate("classId trainer user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    booking.status = "Cancelled";
    await booking.save();

    // ✅ Send cancellation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.user.email,
      subject: "Booking Cancellation - Fitness Hub",
      html: `
        <h2>Booking Cancelled ❌</h2>
        <p>Hi ${booking.user.userName},</p>
        <p>Your booking for <strong>${booking.classId.title}</strong> with trainer <strong>${booking.trainer.userName}</strong> has been cancelled.</p>
        <p>If this was a mistake, you can rebook anytime!</p>
        <br />
        <p>Best Regards,<br />Fitness Hub Team</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error:", error);
      } else {
        console.log("Cancellation email sent:", info.response);
      }
    });

    res.json({ message: "Booking cancelled successfully. Email sent.", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
