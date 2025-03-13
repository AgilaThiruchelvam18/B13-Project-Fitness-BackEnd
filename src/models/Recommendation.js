const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recommendedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
}, { timestamps: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);
