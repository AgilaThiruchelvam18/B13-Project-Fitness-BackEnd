const mongoose = require("mongoose");

const TrainerSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  expertise: { type: [String] }, // Example: ["Yoga", "Strength Training"]
  specialization: { type: [String], default: [] }, // Example: ["Weight Loss", "Muscle Gain"]
  experience: { type: Number, default: 0 }, // Years of experience
  phone: { type: String },
  bio: { type: String },
  certifications: { type: [String], default: [] }, // Example: ["Certified Personal Trainer"]
  ratings: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, default: 0 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  // coverMedia: {
  //   url: { type: String, default: null },
  //   type: { type: String, enum: ["image", "video"], default: "image" },
  // },
  mediaUploads: [
    {
      url: { type: String,  default: null },
      type: { type: String, enum: ["image", "video"], default: "image" },
    },
  ],
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  // isVerified: { type: Boolean, default: false }, // Email verification
  createdAt: { type: Date, default: Date.now },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
});

module.exports = mongoose.models.Trainer || mongoose.model("Trainer", TrainerSchema);
