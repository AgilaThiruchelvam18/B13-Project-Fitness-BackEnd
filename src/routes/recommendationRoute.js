const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

router.get("/:userId", recommendationController.getRecommendations);
router.post("/:userId", recommendationController.generateRecommendations);

module.exports = router;
