const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true, enum: ["Yoga", "Strength Training", "Cardio", "Zumba", "Meditation", "Nutrition"] },
  duration: { type: Number, required: true },
  // timeSlots: [{ day: String, time: String }],
    price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  image: { type: String },  // URL of the class image
  video: { type: String }   // URL of the class video
});

module.exports = mongoose.model("Class", ClassSchema);
