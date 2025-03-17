const express = require("express");
const {
  createClass,
  updateClass,
  deleteClass,
  getClassById,
  getAllClasses,
  getTrainerClasses,  // New controller for fetching trainer's classes
}= require( "../controllers/classController.js");
const { protectTrainer } = require("../middleware/authMiddleware");
const router = express.Router();

// Create a new class (Trainer only)
router.post("/", protectTrainer, createClass);

// Update class (Trainer only)
router.put("/:id", protectTrainer, updateClass);

// Delete class (Trainer only)
router.delete("/:id", protectTrainer, deleteClass);

// Get a single class by ID (Public)
router.get("/:id", getClassById);

// Get all classes (Public or protected if needed)
router.get("/", getAllClasses);

// Get classes created by the logged-in trainer
router.get("/trainer", protectTrainer, getTrainerClasses);

module.exports = router;
