// const mongoose = require("mongoose");

// const ProjectSchema = new mongoose.Schema({
//   name: String,
//   type: String, // DSA, WEB, ML, DEBUG
//   userId: mongoose.Schema.Types.ObjectId,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Project", ProjectSchema);
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["DSA", "WEB", "ML", "DEBUG"], // Restrict to defined values
    required: true
  },
  userId: { type: String, required: true }, // Changed from ObjectId to String for consistency with Session model
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", ProjectSchema);