const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true }, // Trainer ID (Reference)
    title: { type: String, required: true }, // Class Name
    description: { type: String },
    category: { 
      type: String, 
      required: true, 
      enum: ["Yoga", "Strength Training", "Cardio", "Zumba", "Meditation", "Nutrition"] 
    }, // Fitness Category
   timeSlots: [{ day: String, time: String }],
    duration: { type: Number, required: true }, // Duration in minutes
    capacity: { type: Number, required: true }, // Maximum Participants
    price: { type: Number, required: true }, // Price in currency
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

module.exports = mongoose.model("Class", ClassSchema);
