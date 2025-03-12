const Class = require("../models/Class");
const Trainer = require("../models/Trainer");

const createClass = async (req, res) => {
  try {
    console.log("📩 Received request body:", req.body); // Log request payload

    const { title, description, category, duration, timeSlots, capacity, price, trainer } = req.body;

    if (!trainer) {
      console.error("❌ Trainer ID is missing!");
      return res.status(400).json({ error: "Trainer ID is required" });
    }

    // Check if trainer exists
    const trainerDetails = await Trainer.findById(trainer);
    if (!trainerDetails) {
      console.error("❌ Trainer not found with ID:", trainer);
      return res.status(404).json({ error: "Trainer not found" });
    }

    // Ensure timeSlots is a non-empty array
    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ error: "Time slots must be a non-empty array" });
    }

    // Create new class
    const newClass = new Class({
      title,
      description,
      category,
      duration,
      timeSlots,
      capacity,
      price,
      trainer, // Trainer ID stored here
    });

    const savedClass = await newClass.save();
    console.log("✅ Class created successfully:", savedClass);

    // Update trainer's classes array
    trainerDetails.classes.push(savedClass._id);
    await trainerDetails.save();
    console.log("✅ Trainer updated with new class");

    res.status(201).json(savedClass);
  } catch (error) {
    console.error("❌ Error creating class:", error);
    res.status(500).json({ error: "Failed to create class", details: error.message });
  }
};

// // ✅ Update a class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(updatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all classes created by a trainer
const getTrainerClasses = async (req, res) => {
  try {
    const trainerId = req.user._id; // Extract trainer ID from token
    const classes = await Class.find({ trainer: trainerId });

    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching trainer classes:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all upcoming classes (for customers)
const AllTrainerClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("trainer", "userName email ratings");
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching all classes:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClass, updateClass, deleteClass, getTrainerClasses, AllTrainerClasses };
