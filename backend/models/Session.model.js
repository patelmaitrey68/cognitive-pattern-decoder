const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: String,
  projectId: String,

  typingSpeed: Number,
  typedChars: Number,
  backspaceCount: Number,
  pasteCount: Number,
  pasteCharacters: Number,
  saveCount: Number,
  fileSwitchCount: Number,
  cursorMoveCount: Number,
  avgPauseTime: Number,
  sessionTime: Number,
  // 🔥 ML Fields
  cluster: Number,
  clusterMeaning: String,


  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", SessionSchema);
