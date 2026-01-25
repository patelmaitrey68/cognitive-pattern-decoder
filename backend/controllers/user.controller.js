const User = require("../models/User.model");
const Session = require("../models/Session.model");

// 📊 Compare a user with overall platform averages
exports.compareUser = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email query is required" });
    }

    // 🔎 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 📁 Fetch sessions of this user
    const userSessions = await Session.find({ userId: user._id });

    if (userSessions.length === 0) {
      return res.status(404).json({ error: "No session data for this user" });
    }

    // 🧮 Helper to calculate average
    const average = (arr, key) =>
      arr.reduce((sum, item) => sum + (item[key] || 0), 0) / arr.length;

    // 👤 User averages
    const userStats = {
      typingSpeed: average(userSessions, "typingSpeed"),
      backspaceCount: average(userSessions, "backspaceCount"),
      avgPauseTime: average(userSessions, "avgPauseTime"),
      sessionTime: average(userSessions, "sessionTime")
    };

    // 🌍 Overall averages (all users)
    const allSessions = await Session.find();

    const overallStats = {
      typingSpeed: average(allSessions, "typingSpeed"),
      backspaceCount: average(allSessions, "backspaceCount"),
      avgPauseTime: average(allSessions, "avgPauseTime"),
      sessionTime: average(allSessions, "sessionTime")
    };

    res.json({
      user: user.email,
      userStats,
      overallStats
    });

  } catch (error) {
    console.error("Compare User Error:", error);
    res.status(500).json({ error: "Failed to compare user" });
  }
};
