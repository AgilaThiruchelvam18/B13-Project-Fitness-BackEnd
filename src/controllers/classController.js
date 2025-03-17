import mongoose from "mongoose";
import Class from "../models/schema-class.js";

// ✅ Create Class
export const createClass = async (req, res) => {
  try {
    const { title, description, category, duration, image, capacity, price, schedule } = req.body;

    if (!title || !description || !category || !duration || !capacity || !price || !schedule) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newClass = new Class({
      trainer: req.user._id,
      title,
      description,
      category,
      duration,
      image,
      capacity,
      price,
      schedule,
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update Class (Trainer can only update their own class)
export const updateClass = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const classToUpdate = await Class.findById(req.params.id);

    if (!classToUpdate) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classToUpdate.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this class" });
    }

    const { title, description, category, duration, image, capacity, price, schedule } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { title, description, category, duration, image, capacity, price, schedule },
      { new: true }
    );

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Class (Trainer can only delete their own class)
export const deleteClass = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const classToDelete = await Class.findById(req.params.id);

    if (!classToDelete) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classToDelete.trainer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this class" });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Class
export const getClassById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const classData = await Class.findById(req.params.id).populate("trainer", "name email");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Classes (Added Pagination)
export const getAllClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const classes = await Class.find()
      .populate("trainer", "name email")
      .skip(skip)
      .limit(limit);

    const totalClasses = await Class.countDocuments();

    res.status(200).json({
      totalPages: Math.ceil(totalClasses / limit),
      currentPage: page,
      classes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
