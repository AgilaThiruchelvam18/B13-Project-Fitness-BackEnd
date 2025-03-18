const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Yoga", "Strength Training", "Zumba", "Meditation", "Cardio", "Nutrition"], required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  schedule: {
    scheduleType: { type: String, enum: ["One-time", "Recurrent"], required: true },
    oneTimeDate: { type: Date },
    oneTimeStartTime: { type: String },
    oneTimeEndTime: { type: String },
    enabledDays: [{ type: String }],
    timeSlots: { type: Map, of: [{ day:String,startTime: String, endTime: String }] },
    blockedDates: [{ type: Date }],
    startDate: { type: Date },
    endDate: { type: Date },
  },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);