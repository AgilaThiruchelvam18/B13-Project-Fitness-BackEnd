const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Class = require("../models/Class.js");
// const Trainer = require("../models/Trainer.js");
// const User = require("../models/User");
// Get all users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate({
      path: "trainer",
      select: "name email",
      options: { strictPopulate: false } // ✅ Prevents errors if trainer is missing
    });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a single user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    console.log("req.body",req.body);
    console.log("req.params.id",req.params.id);

    if(req.body.password)
    {
      const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password=hashedPassword;
           
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log("updatedUser",updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
