const mongoose = require("mongoose");

const TrainerSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  expertise: { type: [String] }, // Example: ["Yoga", "Strength Training"]
  phone: { type: String },
  bio: { type: String },
  certifications: { type: [String], default: [] }, // Example: ["Certified Personal Trainer"]
  availability: [
    {
      day: { type: String }, // Example: "Monday"
      timeSlots: { type: [String] }, // Example: ["08:00-09:00", "18:00-19:00"]
    }
  ],
  ratings: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  coverMedia: {
    url: { type: String, default: null }, 
    type: { type: String, enum: ["image", "video"], default: "image" },
  },
  socialLinks: {
    facebook: { type: String, default: null },
    instagram: { type: String, default: null },
    twitter: { type: String, default: null },
    linkedin: { type: String, default: null },
    youtube: { type: String, default: null },
  },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  isVerified: { type: Boolean, default: false }, // Email verification
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Trainer || mongoose.model("Trainer", TrainerSchema);
