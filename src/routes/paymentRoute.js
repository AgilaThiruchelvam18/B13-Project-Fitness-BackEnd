const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const router = express.Router();
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

router.post("/order",protectCustomer, createOrder);
router.post("/verify", verifyPayment);

module.exports = router;
