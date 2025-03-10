const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  day: { type: String, required: true },
  amPm: { type: String, enum: ["AM", "PM"], required: true },
  month: { type: String, required: true },
  weekStart: { type: String, required: true },
  weekEnd: { type: String, required: true },
});

const ClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Yoga", "Strength Training", "Cardio", "Meditation", "Zumba", "Nutrition"],
    required: true,
  },
  duration: { type: Number, required: true },
  timeSlots: [TimeSlotSchema], // ✅ Array of time slot objects
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true }, // Link to Trainer
}, { timestamps: true });

module.exports = mongoose.model("Class", ClassSchema);
