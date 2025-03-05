const Class = require("../models/Class");

// Create a class
exports.createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: "Error creating class", error: err.message });
  }
};

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate("trainer", "name");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching classes", error: err.message });
  }
};

// Get class by ID
exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate("trainer", "name");
    if (!classData) return res.status(404).json({ message: "Class not found" });
    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: "Error fetching class", error: err.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ message: "Error updating class", error: err.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting class", error: err.message });
  }
};
