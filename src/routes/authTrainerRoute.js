const express = require("express");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const {
  requestPasswordReset,
  resetPassword,
  getTrainerProfile,
  login,
  register
} = require("../controllers/authTrainerController");

const router = express.Router();

// Multer setup for file uploads (profile picture / video)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Validation rules for trainer registration
const registerValidation = [
  check("userName", "Please include a valid userName").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
  check("confirmPassword", "Passwords must match").custom((value, { req }) => value === req.body.password),
  // check("phone", "Phone number must be 10 digits").optional().isLength({ min: 10, max: 10 }),
  // check("expertise", "At least one expertise is required").isArray({ min: 1 }),
  // check("availability", "Availability must be an array").isArray(),
  // check("facebook").optional().isURL(),
  // check("instagram").optional().isURL(),
  // check("twitter").optional().isURL(),
  // check("linkedin").optional().isURL(),
  // check("youtube").optional().isURL(),
];

// ✅ Fix: Define `loginValidation`
const loginValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").not().isEmpty(),
];

// Trainer Registration
router.post("/register", upload.single("coverMedia"), registerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Append cover media details
  // if (req.file) {
  //   req.body.coverMedia = {
  //     url: `uploads/${req.file.filename}`,
  //     type: req.body.coverMediaType || "image",
  //   };
  // }

  // Default ratings (will be updated later by reviews)
  req.body.ratings = {
    averageRating: 0,
    totalReviews: 0,
  };

  register(req, res);
});

// Trainer Login
router.post("/login", loginValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  login(req, res);
});

module.exports = router;
