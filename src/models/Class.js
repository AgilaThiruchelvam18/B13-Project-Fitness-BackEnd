const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Yoga", "Strength Training", "Zumba", "Meditation", "Cardio", "Nutrition"],
      required: true,
    },
    duration: { type: Number }, // Removed `required: true` because it will be auto-calculated
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    schedule: {
      scheduleType: { type: String, enum: ["One-time", "Recurrent"], required: true },
      oneTimeDate: { type: Date },
      oneTimeStartTime: { type: String },
      oneTimeEndTime: { type: String },
      enabledDays: [{ type: String }],
      timeSlots: [
        {
          date: { type: Date, required: true },
          day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            required: true,
          },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
      startDate: { type: Date },
      endDate: { type: Date },
    },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate duration
classSchema.pre("save", function (next) {
  if (this.schedule.oneTimeStartTime && this.schedule.oneTimeEndTime) {
    const startTime = new Date(`1970-01-01T${this.schedule.oneTimeStartTime}:00`);
    const endTime = new Date(`1970-01-01T${this.schedule.oneTimeEndTime}:00`);
    this.duration = Math.round((endTime - startTime) / (1000 * 60)); // Convert milliseconds to minutes
  } else if (this.schedule.timeSlots.length > 0) {
    this.duration = this.schedule.timeSlots.map(slot => {
      const start = new Date(`1970-01-01T${slot.startTime}:00`);
      const end = new Date(`1970-01-01T${slot.endTime}:00`);
      return Math.round((end - start) / (1000 * 60));
    })[0]; // Take the first time slot's duration
  }
  next();
});

module.exports = mongoose.model("Class", classSchema);
