const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Trainer = require("../models/Trainer");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register Trainer
exports.register = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      phone,
      bio,
      expertise,
      specialization,
      experience,
      certifications
    } = req.body;

    let existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ message: "Trainer already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let mediaUploads = [];
    if (req.files) {
      mediaUploads = req.files.map((file) => ({
        url: `uploads/${file.filename}`,
        type: file.mimetype.startsWith("image") ? "image" : "video"
      }));
    }

    const trainer = new Trainer({
      userName,
      email,
      password: hashedPassword,
      expertise,
      phone: req.body.phone || "",
      bio,
      specialization,
      experience: experience || 0,
      certifications,
      media: mediaUploads,
            ratings: {
        averageRating: 4,
        totalReviews: 5, 
      },
      isVerified: false, // Default is false, change to true after email verification
    });

    await trainer.save();
    
    res.status(201).json({
      message: "Trainer registered successfully",
      trainer: {
        id: trainer._id,
        email: trainer.email,
        userName: trainer.userName,
        isVerified: trainer.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating trainer", error: error.message });
  }
};

// Trainer Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ email });

    if (!trainer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, trainer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!trainer.isVerified) {
      return res.status(401).json({ message: "Email not verified. Please verify your email." });
    }

    const token = jwt.sign({ id: trainer._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("trainer_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "Strict",
    });

    res.json({
      message: "Login successful",
      trainer: {
        id: trainer._id,
        email: trainer.email,
        userName: trainer.userName,
        isVerified: trainer.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const trainer = await Trainer.findOne({ email });

    if (!trainer) return res.status(400).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: trainer._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    trainer.resetToken = resetToken;
    trainer.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await trainer.save();

    const resetLink = `${process.env.CLIENT_URL}/trainer/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: trainer.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 15 minutes.</p>`,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const trainer = await Trainer.findById(decoded.id);

    if (!trainer || trainer.resetToken !== token || trainer.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    trainer.password = await bcrypt.hash(password, 10);
    trainer.resetToken = null;
    trainer.resetTokenExpiry = null;
    await trainer.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Trainer Profile
exports.getProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.trainer.id).select("-password -resetToken -resetTokenExpiry");

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json({ trainer });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Logout Trainer
exports.logoutTrainer = (req, res) => {
  res.clearCookie("trainer_jwt", { httpOnly: true, sameSite: "Strict" });
  res.status(200).json({ message: "Logged out successfully" });
};
