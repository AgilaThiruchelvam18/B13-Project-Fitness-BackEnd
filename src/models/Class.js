// const mongoose = require("mongoose");
// const timeSlotSchema = new mongoose.Schema({
//   date: Date, // Stores the exact date
//   time: String, // Format: "HH:MM AM/PM"
//   recurrence: {
//     type: String,
//     enum: ["one-time", "daily", "weekly", "monthly"],
//     required: true,
//   },
//   recurrenceDetails: {
//     daily: {
//       startDate: Date,
//       endDate: Date,
//     },
//     weekly: [String], // ["Monday", "Wednesday"]
//   },
// });
// const timeSlotSchema = new mongoose.Schema({
//   date: Date, // Stores the exact date
//   time: String, // Format: "HH:MM AM/PM"
//   recurrence: {
//     type: String,
//     enum: ["one-time", "daily", "weekly", "monthly"],
//     required: true,
//   },
//   recurrenceDetails: {
//     daily: {
//       startDate: Date,
//       endDate: Date,
//     },
//     weekly: [String], // ["Monday", "Wednesday"]
//   },
// });
const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Yoga", "Strength Training", "Cardio", "Meditation", "Zumba", "Nutrition"],
      required: true,
    },
    duration: { type: Number, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, required: true },
    schedule: {
      enabledDays: {
        type: [String], // Example: ["Monday", "Wednesday", "Friday"]
        required: true,
      },
      timeSlots: {
        type: [
          {
            day: String, // Example: "Monday"
            slots: [
              {
                startTime: String, // Example: "09:00 AM"
                endTime: String, // Example: "10:00 AM"
              },
            ],
          },
        ],
        default: [],
      },
      blockedDates: { type: [Date], default: [] } // ❌ Removed the trailing comma
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", ClassSchema);
