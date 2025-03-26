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
const path = require("path");
const fs = require("fs");

// Define upload directory
const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// Upload configuration
const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit: 5MB
});

module.exports = upload;

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
