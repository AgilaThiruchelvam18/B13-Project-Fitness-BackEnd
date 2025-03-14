const express = require("express");
const router = express.Router(); // ✅ This is missing!
const { check } = require("express-validator");
const {
  requestPasswordReset,
  resetPassword,
  login,
  register,
  logoutTrainer,
  getTrainerProfile
} = require("../controllers/authTrainerController");
const { protectTrainer } = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Store files in the "uploads/" directory
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Validation Rules
const registerValidation = [
  check("userName", "Please include a valid userName").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
];

const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").not().isEmpty(),
];

const passwordResetValidation = [check("email", "Please include a valid email").isEmail()];
const newPasswordValidation = [check("password", "Password must be at least 6 characters long").isLength({ min: 6 })];

// Trainer Authentication Routes
router.post("/register", registerValidation,  upload.array("mediaUploads", 5), register);
router.post("/login", loginValidation, login);
router.post("/logout", protectTrainer, logoutTrainer);

// Trainer Profile Routes
router.get("/profile", protectTrainer, getTrainerProfile);

// Password Reset Routes
router.post("/request-password-reset", passwordResetValidation, requestPasswordReset);
router.post("/reset-password/:token", newPasswordValidation, resetPassword);

module.exports = router;
