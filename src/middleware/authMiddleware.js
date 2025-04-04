const jwt = require("jsonwebtoken");
const Trainer = require("../models/Trainer");
const User = require("../models/User");

exports.protectCustomer = async (req, res, next) => {
    try {
      const token = req.cookies.customer_jwt; // Get token from HTTP-only cookie
      console.log("Cookies received:", req.cookies);  // ✅ Debugging line

      if (!token) return res.status(401).json({ message: "Unauthorized access" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
console.log("req.user",req.user);
      if (!req.user) return res.status(401).json({ message: "User not found" });
  
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  
exports.protectTrainer = async (req, res, next) => {
  try {
    const token = req.cookies.trainer_jwt; // Get token from HTTP-only cookie
    console.log("Cookies received:", req.cookies);  // ✅ Debugging line

    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Trainer.findById(decoded.userId).select("-password");

    if (!req.user) return res.status(401).json({ message: "User not found" });
console.log("req.user",req.user);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
