const express = require("express");
const router = express.Router();
const { getAllTrainers, getTrainerById, updateTrainer, deleteTrainer } = require("../controllers/trainerController");

router.get("/", getAllTrainers);
router.get("/:id", getTrainerById);
router.put("/:id", updateTrainer);
router.delete("/:id", deleteTrainer);

module.exports = router;
