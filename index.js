const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require('./src/config/db.js');
dotenv.config();
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",  // ✅ Development
  "https://fitnesshub-aa.netlify.app", // ✅ Netlify frontend
  "https://fitnesshub-5yf3.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // ✅ Allow sending cookies
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow custom headers
}));

app.use(cookieParser());
app.options("*", cors());
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
const dashboardRoutes = require("./src/routes/DashboardRoutes");

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

// Use routes
app.use("/api", dashboardRoutes);
// app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

