const express = require("express");import {
  createClass,
  updateClass,
  deleteClass,
  getClassById,
  getAllClasses,
  getTrainerClasses,  // New controller for fetching trainer's classes
} from "../controllers/class-controller.js";
import { protect, trainerProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new class (Trainer only)
router.post("/", trainerProtect, createClass);

// Update class (Trainer only)
router.put("/:id", trainerProtect, updateClass);

// Delete class (Trainer only)
router.delete("/:id", trainerProtect, deleteClass);

// Get a single class by ID (Public)
router.get("/:id", getClassById);

// Get all classes (Public or protected if needed)
router.get("/", getAllClasses);

// Get classes created by the logged-in trainer
router.get("/trainer", trainerProtect, getTrainerClasses);

export default router;
