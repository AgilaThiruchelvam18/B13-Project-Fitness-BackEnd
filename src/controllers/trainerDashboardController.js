const Class = require("../models/Class");
const Booking = require("../models/Booking");

// Get trainer dashboard data
exports.getTrainerDashboard = async (req, res) => {
  try {
    const trainerId = req.user._id; // Get trainer ID from the request

    // Fetch classes conducted by the trainer
    // const myClasses = await Class.find({ trainer: trainerId });

    // Fetch bookings for the trainer's classes
    // const myBookings = await Booking.find({ trainer: trainerId }).populate("customer");

    // Calculate total students enrolled
    // const totalStudents = myBookings.length;

    res.json({
      message: "Trainer dashboard data retrieved successfully",
    //   myClasses,
    //   myBookings,
    //   totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching trainer dashboard data", error });
  }
};
