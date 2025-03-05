const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require('./src/config/db.js');
const cors = require("cors");
dotenv.config();
const app = express();
app.use(
    cors({
      origin: "http://localhost:5173", // Your frontend URL
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
app.use(express.json()); // Parses JSON request body
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request body

connectDB();
// Import Routes
const authUserRoutes = require("./src/routes/authUserRoute");
const authTrainerRoutes = require("./src/routes/authTrainerRoute");
const userRoutes = require("./src/routes/userRoute");
const trainerRoutes = require("./src/routes/trainerRoute");
const classRoutes = require("./src/routes/classRoute");
const bookingRoutes = require("./src/routes/bookingRoute");
const reviewRoutes = require("./src/routes/reviewRoute");
const recommendationRoutes = require("./src/routes/recommendationRoute");
// const paymentRoutes = require("./src/routes/paymentRoute");

// // Use Routes
app.use("/api/user-auth", authUserRoutes);
app.use("/api/trainer-auth", authTrainerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/recommendations", recommendationRoutes);
// app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

