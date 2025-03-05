const sendEmail = require("./emailService");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Trainer = require("../models/Trainer");

const sendClassReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await Booking.find({ date: tomorrow.toISOString().split("T")[0] }).populate("user trainer");

  bookings.forEach(async (booking) => {
    await sendEmail(
      booking.user.email,
      "Class Reminder - Fitness Session",
      `<p>Dear ${booking.user.name},</p>
      <p>Reminder: You have a fitness class scheduled with <strong>${booking.trainer.name}</strong> tomorrow.</p>
      <p>Class: ${booking.classType}</p>
      <p>Date: ${booking.date}, Time: ${booking.time}</p>
      <p>Don't forget to join on time!</p>`
    );
  });
};

module.exports = sendClassReminders;
