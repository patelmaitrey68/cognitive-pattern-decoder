

// const MLResultSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
//   sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
//   cluster: Number,
//   createdAt: { type: Date, default: Date.now }
// });
// const MLResultSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
//   sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
//   cluster: { type: Number, required: true }
// }, { timestamps: true });
// module.exports = mongoose.model("MLResult", MLResultSchema);
const mongoose = require("mongoose");

const MLResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true
    },

    cluster: {
      type: Number,
      required: true
    },

    clusterMeaning: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.MLResult || mongoose.model("MLResult", MLResultSchema);