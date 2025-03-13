const express = require("express");
const { check, validationResult } = require("express-validator");
const {
  requestPasswordReset,
  resetPassword,
  login,
  register,logoutTrainer,getTrainerProfile
} = require("../controllers/authTrainerController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

const multer = require("multer");

const storage = multer.memoryStorage(); // Store in memory or change to disk storage if needed
const upload = multer({ storage });

const router = express.Router();

const registerValidation = [
  check("userName", "Please include a valid userName").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
];

const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").not().isEmpty(),
];

router.post("/register", registerValidation, upload.single("profilePicture"), register);
router.post("/login", loginValidation, login);
router.post("/request-password-reset", check("email").isEmail(), requestPasswordReset);
router.post("/reset-password/:token", check("password").isLength({ min: 6 }), resetPassword);
router.get("/profile", protectTrainer, getTrainerProfile);
router.post("/logout", protectTrainer, logoutTrainer);

module.exports = router;
