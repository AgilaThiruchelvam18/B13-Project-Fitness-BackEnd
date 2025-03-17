const mongoose = require("mongoose");
const Class=require("../models/Class.js");
const Trainer=require("../models/Trainer.js");

// @desc    Create a new class
// @route   POST /api/classes
// @access  Trainer only
exports.createClass = async (req, res) => {
  try {
    const { title, description, category, duration, price, capacity, schedule } = req.body;

    if (!title || !description || !category || !duration || !price || !capacity || !schedule) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 Ensure the requesting user is a trainer
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // 🔹 Create new class
    const newClass = new Class({
      title,
      description,
      category,
      duration: Number(duration), // Convert to Number
      price: Number(price),
      capacity: Number(capacity),
      schedule,
      trainer: trainer._id, // Assign trainer ID
    });

    await newClass.save(); // 🔹 Save the class first

    // 🔹 Update trainer's classes array
    trainer.classes.push(newClass._id);
    await trainer.save();

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get a single class by ID
// @route   GET /api/classes/:id
// @access  Public
exports.getClassById = async (req, res) => {
  try {
    const fitnessClass = await Class.findById(req.params.id);
    if (!fitnessClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json(fitnessClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update class details
// @route   PUT /api/classes/:id
// @access  Trainer only
exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Trainer only
exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
