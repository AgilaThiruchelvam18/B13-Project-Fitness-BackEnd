const express = require("express");
const { check, validationResult } = require("express-validator");
const {
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  login,
  register,
  passwordChange
} = require("../controllers/authUserController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

// const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store in memory or change to disk storage if needed
const upload = multer({ storage });
 upload.single("profilePicture")
const router = express.Router();
const registerValidation = [
    check("userName", "Please include a valid userName"),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
  ];
  
  const loginValidation = [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").not().isEmpty(),
  ];
  
  router.post("/register", registerValidation,upload.single("profilePicture"),(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    register(req, res);
  });
  
  router.post("/login", loginValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    login(req, res);
  });
  
router.post(
  "/request-password-reset",
  check("email", "Please include a valid email").isEmail(),
  requestPasswordReset
);

router.post(
  "/reset-password/:token",
  check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  resetPassword
);

router.get("/profile", protectCustomer, getUserProfile);
// router.put("/change-password", protectCustomer,passwordChange);
module.exports = router;
