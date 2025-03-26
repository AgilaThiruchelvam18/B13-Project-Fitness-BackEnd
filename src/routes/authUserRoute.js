const express = require("express");
const { check, validationResult } = require("express-validator");
const {
  requestPasswordReset,
  resetPassword,
  getUserProfile,
  login,
  register,
  logoutUser
} = require("../controllers/authUserController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

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
  
  router.post("/register", registerValidation,(req, res) => {
    console.log("Received Body:", req.body);  // ✅ Check received data
    console.log("Headers:", req.headers); 
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
router.post("/logout", protectCustomer, logoutUser);

module.exports = router;
