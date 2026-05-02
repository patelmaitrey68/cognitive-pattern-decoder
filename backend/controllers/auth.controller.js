const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MLResult = require("../models/MLResult.model");
const Session = require("../models/Session.model");


const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: "30d" });
  return { accessToken, refreshToken };
};

// REGISTER — auto-login by returning token + user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash: hashedPassword });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens = [refreshToken];
    await user.save();

    res.status(201).json({
      token: accessToken, // Keeping 'token' for backwards compatibility
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// LOGIN — JWT CREATED HERE
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Add the new refresh token to the user's array
    if (!user.refreshTokens) user.refreshTokens = [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      token: accessToken, // Keeping 'token' for backwards compatibility
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) return res.status(401).json({ message: "Refresh token is required." });

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Refresh token rotation
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) return res.status(400).json({ message: "Refresh token is required." });

    const user = await User.findOne({ refreshTokens: token });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      await user.save();
    }

    res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed." });
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
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.settings) {
      const newSettings = typeof req.body.settings === 'string' 
        ? JSON.parse(req.body.settings) 
        : req.body.settings;
      
      user.settings = {
        ...user.settings,
        ...newSettings
      };
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      settings: user.settings
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};