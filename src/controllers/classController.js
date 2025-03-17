const mongoose = require("mongoose");
const Class=require("../models/Class.js");
const Trainer=require("../models/Trainer.js");

// @desc    Create a new class
// @route   POST /api/classes
// @access  Trainer only
exports.createClass = async (req, res) => {
  try {
    const { title, description, category, duration, price, capacity, schedule } = req.body;

    if (!["One-time", "Recurrent"].includes(schedule.scheduleType)) {
      return res.status(400).json({ message: "Invalid schedule type" });
    }

    // 🔹 Validate One-time schedule
    if (schedule.scheduleType === "One-time") {
      if (!schedule.oneTimeDate || !schedule.oneTimeStartTime || !schedule.oneTimeEndTime) {
        return res.status(400).json({ message: "One-time schedule must have a date and start/end time." });
      }
    }

    // 🔹 Validate Recurrent schedule
    if (schedule.scheduleType === "Recurrent") {
      if (!schedule.startDate || !schedule.endDate || schedule.enabledDays.length === 0) {
        return res.status(400).json({ message: "Recurrent schedule must have start date, end date, and selected days." });
      }
    }

    const newClass = new Class({ title, description, category, duration, price, capacity, schedule });
    await newClass.save();
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
    const { title, description, category, duration, price, capacity, schedule } = req.body;

    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) return res.status(404).json({ message: "Class not found" });

    if (existingClass.trainer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    existingClass.title = title || existingClass.title;
    existingClass.description = description || existingClass.description;
    existingClass.category = category || existingClass.category;
    existingClass.duration = duration || existingClass.duration;
    existingClass.price = price || existingClass.price;
    existingClass.capacity = capacity || existingClass.capacity;

    // 🔹 Update schedule with same validation as create route
    if (schedule) {
      if (!["One-time", "Recurrent"].includes(schedule.scheduleType)) {
        return res.status(400).json({ message: "Invalid schedule type" });
      }

      if (schedule.scheduleType === "One-time") {
        if (!schedule.startDate || !schedule.timeSlots["One-time"]) {
          return res.status(400).json({ message: "Start date and time slot required for One-time classes" });
        }
        schedule.enabledDays = [];
        schedule.endDate = null;
      } else {
        if (!schedule.startDate || !schedule.endDate || schedule.enabledDays.length === 0) {
          return res.status(400).json({ message: "Start date, end date, and enabled days required for Recurrent classes" });
        }
      }

      existingClass.schedule = schedule;
    }

    await existingClass.save();
    res.json(existingClass);
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
