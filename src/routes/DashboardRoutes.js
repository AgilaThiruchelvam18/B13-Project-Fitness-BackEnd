const express = require("express");
const { getCustomerDashboard } = require("../controllers/customerDashboardController");
const { getTrainerDashboard } = require("../controllers/trainerDashboardController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

const router = express.Router();

// Customer dashboard (protected route)
router.get("/customer/dashboard", protectCustomer, getCustomerDashboard);

// Trainer dashboard (protected route)
router.get("/trainer/dashboard", protectTrainer, getTrainerDashboard);

module.exports = router;
