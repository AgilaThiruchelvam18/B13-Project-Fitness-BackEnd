const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

router.post("/",protectCustomer, bookingController.createBooking);
// router.get("/", protectCustomer, bookingController.getMyBookings);
// router.get("/:id",protectCustomer,  bookingController.getBookingById);
router.put("/:id/cancel", protectCustomer, bookingController.cancelBooking);
// router.delete("/:id",protectCustomer,  bookingController.cancelBooking);
router.get("/", protectCustomer, bookingController.getBookings);
router.put("/bookings/:id/update", protectCustomer, bookingController.bookingUpdate);
module.exports = router;
