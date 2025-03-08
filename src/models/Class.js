const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  category: { type: String, enum: ["Yoga", "Strength", "Cardio","zumba","Meditation","Nutrition"], required: true },
  duration: { type: Number, required: true }, // in minutes
  capacity: { type: Number, required: true },
  schedule: { type: Date, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);
