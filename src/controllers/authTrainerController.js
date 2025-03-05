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
      const { userName, email, password } = req.body;
      
      let trainer = await Trainer.findOne({ email });
      if (trainer) return res.status(400).json({ message: "User already exists" });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      trainer = new Trainer({ userName, email, password: hashedPassword });
      await trainer.save();
  
      res.status(201).json({ message: "User registered successfully" });
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
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
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

    const resetLink = `${process.env.FRONTEND_URL}/customer/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: trainer.email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`
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


// exports.getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("-password");
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };
