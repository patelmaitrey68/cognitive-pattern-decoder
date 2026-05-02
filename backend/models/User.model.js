const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String,required: false },
  email:  { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  profileImage: { type: String },
  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    fatigueAlerts: { type: Boolean, default: true },
    distractionAlerts: { type: Boolean, default: true },
    focusCelebrations: { type: Boolean, default: true }
  },
  refreshTokens: [{ type: String }]
});

module.exports = mongoose.model("User", UserSchema);
