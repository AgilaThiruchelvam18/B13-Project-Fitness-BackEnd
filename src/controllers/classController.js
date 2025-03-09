const Class = require("../models/Class");
const Trainer = require("../models/Trainer");
const cloudinary = require("../utils/cloudinary"); // For image/video uploads

// Create a class
const createClass = async (req, res) => {
  try {
    const { title, description, type, duration, timeSlots, price, availability } = req.body;
    let imageUrl = "", videoUrl = "";

    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image.path);
      imageUrl = result.secure_url;
    }
    if (req.files?.video) {
      const result = await cloudinary.uploader.upload(req.files.video.path, { resource_type: "video" });
      videoUrl = result.secure_url;
    }

    const newClass = await Class.create({
      trainer: req.user.id,
      title,
      description,
      type,
      duration,
      timeSlots,
      price,
      availability,
      image: imageUrl,
      video: videoUrl
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
    const classes = await Class.find({ trainer: req.user.id });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClass, updateClass, deleteClass, getTrainerClasses };
