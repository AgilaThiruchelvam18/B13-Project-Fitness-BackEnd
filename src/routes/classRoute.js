const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const { protectTrainer } = require("../middleware/authMiddleware");

router.post("/classes", protectTrainer, classController.createClass);
router.put("/classes/:id", protectTrainer, classController.updateClass);
router.delete("/classes/:id", protectTrainer, classController.deleteClass);
router.get("/classes", protectTrainer, classController.getTrainerClasses);

module.exports = router;
