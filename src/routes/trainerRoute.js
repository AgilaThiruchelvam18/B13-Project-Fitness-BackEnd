const express = require("express");
const router = express.Router();
const { getAllTrainers, getTrainerById, updateTrainer, deleteTrainer } = require("../controllers/trainerController");
const { protectTrainer } = require("../middleware/authMiddleware");
const trainerController = require("../controllers/trainerController");
  

router.get("/", getAllTrainers);
router.get("/:id", getTrainerById);
router.put("/:id", updateTrainer);
router.delete("/:id", deleteTrainer);
router.put("/schedule", protectTrainer, trainerController.manageSchedule);
router.get("/bookings", protectTrainer, trainerController.getBookings);
router.put("/profile", protectTrainer, trainerController.updateProfile);
router.get("/earnings", protectTrainer, trainerController.getEarnings);
router.get("/overview", protectTrainer, trainerController.getTrainerOverview);
module.exports = router;




module.exports = router;