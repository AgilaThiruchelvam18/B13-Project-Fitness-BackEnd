
const Trainer = require("../models/Trainer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.register = async (req, res) => {
  try {
    const { userName, email, password, expertise, phone, bio, certifications } = req.body;
// , availability, facebook, instagram, twitter, linkedin, youtube
    let trainer = await Trainer.findOne({ email });
    if (trainer) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle cover media
    let coverMedia = { url: null, type: "image" };
    if (req.file) {
      coverMedia = {
        url: `uploads/${req.file.filename}`,
        type: req.body.coverMediaType || "image",
      };
    }

    trainer = new Trainer({
      userName,
      email,
      password: hashedPassword,
      expertise,
      phone,
      bio,
      certifications,
      ratings: { averageRating: 4, totalReviews: 5 }, // Default ratings
      coverMedia,
    });
      // socialLinks: { facebook, instagram, twitter, linkedin, youtube }
      // availability,

    await trainer.save();
    res.status(201).json({ message: "Trainer registered successfully" });
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

    res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: true, // Ensure this is true only in production with HTTPS
      sameSite: "None",
    })
      .json({ message: "Login successful", user: { id: trainer._id, email: trainer.email } }); // ✅ Fixed incorrect `User`
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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
