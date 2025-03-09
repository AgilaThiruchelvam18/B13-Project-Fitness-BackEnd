const Trainer = require("../models/Trainer");

export const manageSchedule = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.user.id, { schedule: req.body.schedule }, { new: true });
    res.status(200).json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ trainer: req.user.id }).populate("user", "name email");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.status(200).json(updatedTrainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEarnings = async (req, res) => {
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
