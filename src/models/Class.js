const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const scheduleSchema = new mongoose.Schema({
  scheduleType: {
    type: String,
    enum: ["One-time", "Recurrent"],
    required: true,
  },
  enabledDays: { type: [String], default: [] }, // Only needed for "Recurrent"
  timeSlots: { type: Map, of: [timeSlotSchema], default: {} }, // Allows multiple slots per day
  blockedDates: { type: [Date], default: [] },
  startDate: { type: Date, required: true }, // Required for both "One-time" and "Recurrent"
  endDate: { type: Date, required: function () { return this.scheduleType === "Recurrent"; } }, // Only required for "Recurrent"
});

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Yoga", "Strength Training", "Zumba", "Meditation", "Cardio", "Nutrition"],
      required: true,
    },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    schedule: { type: scheduleSchema, required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
