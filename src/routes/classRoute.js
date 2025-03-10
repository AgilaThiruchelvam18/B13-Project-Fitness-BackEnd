const express = require("express");
const router = express.Router();
const {protectCustomer, protectTrainer } = require("../middleware/authMiddleware");
const trainerController = require("../controllers/classController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/", protectTrainer, trainerController.createClass);
router.put("/classes/:id", protectTrainer, trainerController.updateClass);
router.delete("/classes/:id", protectTrainer, trainerController.deleteClass);
router.get("/", protectTrainer, trainerController.getTrainerClasses);
router.get("/upcomingclasses", protectCustomer, trainerController.AllTrainerClasses);

module.exports = router;
