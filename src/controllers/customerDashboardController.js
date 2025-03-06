const Booking = require("../models/Booking");
const Class = require("../models/Class");

// Get customer dashboard data
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user._id; // Get customer ID from the request

    // Fetch bookings for the customer
    // const myBookings = await Booking.find({ customer: customerId }).populate("class");
    
    // Fetch upcoming classes
    // const upcomingClasses = await Class.find({ startDate: { $gte: new Date() } });

    // Fetch recommended classes (for simplicity, fetching latest 5 classes)
    // const recommendedClasses = await Class.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      message: "Customer dashboard data retrieved successfully",
    //   myBookings,
    //   upcomingClasses,
    //   recommendedClasses,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};
