const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MLResult = require("../models/MLResult.model");
const Session = require("../models/Session.model");


// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      passwordHash: hashedPassword
    });

    await user.save();
    console.log("User registered:", user);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) { console.log(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// LOGIN — JWT CREATED HERE
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔐 JWT TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
// 🔍 Compare a user with overall averages
exports.compareUser = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email query is required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's sessions
    const userSessions = await Session.find({ userId: user._id });

    if (userSessions.length === 0) {
      return res.status(404).json({ error: "No session data for this user" });
    }

    // Calculate user averages
    const avg = (arr, key) =>
      arr.reduce((sum, item) => sum + (item[key] || 0), 0) / arr.length;

    const userStats = {
      typingSpeed: avg(userSessions, "typingSpeed"),
      backspaceCount: avg(userSessions, "backspaceCount"),
      avgPauseTime: avg(userSessions, "avgPauseTime"),
      sessionTime: avg(userSessions, "sessionTime")
    };

    // Get overall averages
    const allSessions = await Session.find();

    const overallStats = {
      typingSpeed: avg(allSessions, "typingSpeed"),
      backspaceCount: avg(allSessions, "backspaceCount"),
      avgPauseTime: avg(allSessions, "avgPauseTime"),
      sessionTime: avg(allSessions, "sessionTime")
    };

    res.json({
      user: user.email,
      userStats,
      overallStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to compare user" });
  }
};