const express = require("express");
const { createReview, getTrainerReviews, respondToReview,getReviews } = require("../controllers/reviewController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protectCustomer, createReview); // Submit Review
router.get("/", protectCustomer, getReviews);
router.get("/:trainerId", getTrainerReviews); // Fetch Reviews for a Trainer
router.put("/:reviewId/response", protectTrainer, respondToReview); // Trainer responds

module.exports = router;
