const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  date: Date, // Stores the exact date
  time: String, // Format: "HH:MM AM/PM"
  recurrence: {
    type: String,
    enum: ["one-time", "daily", "weekly", "monthly"],
    required: true,
  },
  recurrenceDetails: {
    daily: {
      startDate: Date,
      endDate: Date,
    },
    weekly: [String], // ["Monday", "Wednesday"]
  },
});

const ClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Yoga", "Strength Training", "Cardio", "Meditation", "Zumba", "Nutrition"],
    required: true,
  },
  duration: { type: Number, required: true },
  timeSlots: [timeSlotSchema], // ✅ Array of time slot objects
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Class", ClassSchema);

