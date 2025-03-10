const Class = require("../models/Class");

// Create a class (Without Cloudinary)
const createClass = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    const { title, description, type, duration, timeSlots, price, availability } = req.body;

    // Create new class
    const newClass = await Class.create({
      trainer: req.user._id,
      title,
      description,
      type,
      duration,
      price,
      availability,
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClass };


// Update a class
const updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a class
const deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trainer's classes
const getTrainerClasses = async (req, res) => {
  try {
    const classes = await Class.find({ trainer: req.user._id });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const AllTrainerClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createClass, updateClass, deleteClass, getTrainerClasses,AllTrainerClasses };
