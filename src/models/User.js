const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" }, // Added phone number field
    fitnessGoal: { type: String, default: "" }, // Updated key to match frontend
    age: { type: Number, default: null }, // Added age field
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "" }, // Added gender field with predefined options
    // profilePicture: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
