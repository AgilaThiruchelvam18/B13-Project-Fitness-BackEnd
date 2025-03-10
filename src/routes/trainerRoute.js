const express = require("express");
const router = express.Router();
const {
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer,
  manageSchedule,
  getTrainerProfile,
  getTrainerId,
//   getBookings,
  updateProfile,
  getEarnings,
//   getTrainerOverview
} = require("../controllers/trainerController");

const { protectTrainer } = require("../middleware/authMiddleware");

// Define routes
router.get("/", getAllTrainers);
router.get("/:id", getTrainerById);
// router.get("/me", protectTrainer,getTrainerId);
router.get("/profile", protectTrainer, getTrainerProfile);
router.put("/schedule", protectTrainer, manageSchedule); // ✅ Moved before dynamic route
router.put("/:id", updateTrainer);
router.delete("/:id", deleteTrainer);
// router.get("/bookings", protectTrainer, getBookings);
router.put("/profile", protectTrainer, updateProfile);
router.get("/earnings", protectTrainer, getEarnings);
// router.get("/overview", protectTrainer, getTrainerOverview);

module.exports = router;
