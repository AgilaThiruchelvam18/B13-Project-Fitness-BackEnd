const express = require("express");
const router = express.Router();
const { protectTrainer } = require("../middleware/authMiddleware");
const trainerController = require("../controllers/classController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/classes", protectTrainer, upload.fields([{ name: "image" }, { name: "video" }]), trainerController.createClass);
router.put("/classes/:id", protectTrainer, trainerController.updateClass);
router.delete("/classes/:id", protectTrainer, trainerController.deleteClass);
router.get("/classes", protectTrainer, trainerController.getTrainerClasses);

module.exports = router;
