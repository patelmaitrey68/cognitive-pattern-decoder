const mongoose = require("mongoose");

const MLResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  cluster: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MLResult", MLResultSchema);
