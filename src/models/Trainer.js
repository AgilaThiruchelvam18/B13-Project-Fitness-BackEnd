const mongoose = require("mongoose");

const TrainerSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
 phone: { type: String },
  expertise: { type: [String],}, //["Yoga", "Strength Training"]
  bio: { type: String },
  certifications: { type: [String], default: [] }, //  ["Certified Personal Trainer"]
  availability: [
    {
      day: { type: String}, // Example: "Monday"
      timeSlots: { type: [String] }, // Example: ["08:00-09:00", "18:00-19:00"]
    }
  ],
  ratings: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
    coverMedia: {
      url: { type: String }, 
      type: { type: String, enum: ["image", "video"]},
    },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    youtube: { type: String },
  },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  isVerified: { type: Boolean, default: false }, // Email verification
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Trainer || mongoose.model("Trainer", TrainerSchema);
