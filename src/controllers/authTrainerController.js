
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Trainer = require("../models/Trainer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
    console.log("Received Files:", req.files); // Debugging
    console.log("Request Body:", req.body);  
    let existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res.status(400).json({ message: "Trainer already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle file uploads
    let mediaUploads = [];
    if (req.files && req.files.length > 0) {
      console.log("Files received:", req.files); // Debugging log

      mediaUploads = req.files.map((file) => ({
        url: `/uploads/${file.filename}`, // Relative path
        type: file.mimetype.startsWith("image") ? "image" : "video"
      }));
    } else {
      console.log("No files uploaded."); // Debugging log
    }

    // Create Trainer
    const trainer = new Trainer({
      userName,
      email,
      password: hashedPassword,
      expertise,
      phone: phone || "",
      bio,
      specialization,
      experience: experience || 0,
      certifications,
      media: mediaUploads,
      ratings: {
        averageRating: 4,
        totalReviews: 5, 
      },
    });

    await trainer.save();

    res.status(201).json({
      message: "Trainer registered successfully",
      trainer: {
        id: trainer._id,
        email: trainer.email,
        userName: trainer.userName,
        media: trainer.media,
      },
    });
  } catch (error) {
    console.error("Error registering trainer:", error); // Debugging log
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

    // if (!trainer.isVerified) {
    //   return res.status(401).json({ message: "Email not verified. Please verify your email." });
    // }

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
        // isVerified: trainer.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ email });

    if (!trainer) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, trainer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: trainer._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("trainer_jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  // ✅ Works in both dev & production
      sameSite: "None",  // ✅ Allows cross-origin requests
    })
    
      .json({ message: "Login successful", user: { id: trainer._id, email: trainer.email } }); // ✅ Fixed incorrect `User`
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// secure: process.env.NODE_ENV === "production", 
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const trainer = await Trainer.findOne({ email });
    if (!trainer) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: trainer._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    trainer.resetToken = resetToken;
    trainer.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await trainer.save();

    const resetLink = `${process.env.FRONTEND_URL}/trainer/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: trainer.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password Trainer. This link expires in 15 minutes.</p>`
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const trainer = await Trainer.findOne({ _id: decoded.id, resetToken: token });

    if (!trainer || trainer.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    trainer.password = await bcrypt.hash(password, 10);
    trainer.resetToken = null;
    trainer.resetTokenExpiry = null;
    await trainer.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTrainerProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.user._id)
    .populate({
      path: "classes",
    })
    .populate({
      path: "reviews.user", // Populate user inside reviews
      model: "User",
      select: "userName email", // Fetch only needed fields
    });
        res.json(trainer);
    } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
exports.logoutTrainer = (req, res) => {
  res.clearCookie("_jwt", { httpOnly: true, secure: true, sameSite: "None" });
  res.status(200).json({ message: "Logged out successfully" });
};
