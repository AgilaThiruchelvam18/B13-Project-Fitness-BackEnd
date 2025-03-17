const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const scheduleSchema = new mongoose.Schema({
  enabledDays: { type: [String], required: true },
  timeSlots: { type: Map, of: [timeSlotSchema], default: {} }, // Allows multiple slots per day
  blockedDates: { type: [Date], default: [] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
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
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
export default Class;
