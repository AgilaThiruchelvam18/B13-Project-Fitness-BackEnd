const express = require("express");
const router = express.Router();
const { getAllClasses, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protectCustomer, protectTrainer } = require("../middleware/authMiddleware");
router.get("/", getAllClasses);
// router.get("/", getAllUsers);
router.get("/:id", protectCustomer,getUserById);
router.put("/:id",protectCustomer, updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
