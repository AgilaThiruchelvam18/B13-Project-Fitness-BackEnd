
// import Trainer from "../models/Trainer";

const Payment = require("../models/Payment");
const Trainer = require("../models/Trainer");

exports.manageSchedule = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.user.id, { schedule: req.body.schedule }, { new: true });
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.status(200).json(updatedTrainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const earnings = await Payment.find({ trainer: req.user.id });
    res.status(200).json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all trainers
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single trainer
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getTrainerId = async (req, res) => { 
try {
  const trainer = await Trainer.findById(req.user.id);
  if (!trainer) return res.status(404).json({ message: "Trainer not found" });
  res.json(trainer);
} catch (error) {
  res.status(500).json({ message: "Server error" });
}
};
exports.getTrainerProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user._id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json(trainer);
  } catch (error) {
    res.status(400).json({ message: "Invalid request", error: error.message });
  }
};


// Update trainer
exports.updateTrainer = async (req, res) => {
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedTrainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete trainer
exports.deleteTrainer = async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
