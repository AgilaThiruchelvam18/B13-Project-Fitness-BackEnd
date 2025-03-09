const Class = require("../models/Class");
const Trainer = require("../models/Trainer");
const Payment = require("../models/Payment");

exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create({ trainer: req.user.id, ...req.body });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrainerClasses = async (req, res) => {
  try {
    const classes = await Class.find({ trainer: req.user.id });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
