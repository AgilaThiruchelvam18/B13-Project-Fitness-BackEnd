const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id",protectCustomer, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
