const Class = require("../models/Class");

// ✅ Create a new class
const createClass = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    const { title, description, category, timeSlots, duration, capacity, price } = req.body;

    // Validate required fields
    if (!title || !category || !duration || !capacity || !price) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Convert timeSlots from string to array of objects (if necessary)
    let formattedTimeSlots = [];
    if (typeof timeSlots === "string") {
      formattedTimeSlots = JSON.parse(timeSlots);
    } else if (Array.isArray(timeSlots)) {
      formattedTimeSlots = timeSlots;
    }

    const newClass = await Class.create({
      trainer: req.user._id, // Trainer ID from auth middleware
      title,
      description,
      category,
      timeSlots: formattedTimeSlots,
      duration,
      capacity,
      price,
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a class
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
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching all classes:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClass, updateClass, deleteClass, getTrainerClasses, AllTrainerClasses };
