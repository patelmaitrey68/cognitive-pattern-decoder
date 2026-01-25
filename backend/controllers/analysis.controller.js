const User = require("../models/User.model");
const Session = require("../models/Session.model");
const MLResult = require("../models/MLResult.model");

exports.getUserPerformance = async (req, res) => {
  try {
    const { email } = req.params;

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2️⃣ Get sessions
    const sessions = await Session.find({ userId: user._id });
    if (sessions.length === 0)
      return res.json({ message: "No session data available" });

    // 3️⃣ Get ML results
    const mlResults = await MLResult.find({ userId: user._id });

    // 4️⃣ Calculate averages
    const avgTyping =
      sessions.reduce((sum, s) => sum + s.typingSpeed, 0) / sessions.length;

    const avgBackspace =
      sessions.reduce((sum, s) => sum + s.backspaceCount, 0) / sessions.length;

    const avgPause =
      sessions.reduce((sum, s) => sum + s.avgPauseTime, 0) / sessions.length;

    // 5️⃣ Cluster distribution
    const clusterCounts = {};
    mlResults.forEach(r => {
      clusterCounts[r.cluster] = (clusterCounts[r.cluster] || 0) + 1;
    });

    // 6️⃣ Performance Logic
    let conclusion = "Balanced coder";
    let suggestion = "Keep practicing regularly";

    if (avgTyping > 60 && avgPause < 1) {
      conclusion = "Fast and focused coder";
      suggestion = "Try more complex problems";
    } else if (avgPause > 3) {
      conclusion = "Needs better focus";
      suggestion = "Reduce distractions and take short breaks";
    } else if (avgBackspace > 40) {
      conclusion = "Struggles with code accuracy";
      suggestion = "Practice problem-solving before coding";
    }

    res.json({
      user: {
        name: user.name,
        email: user.email
      },
      stats: {
        totalSessions: sessions.length,
        avgTypingSpeed: avgTyping.toFixed(2),
        avgBackspaceCount: avgBackspace.toFixed(2),
        avgPauseTime: avgPause.toFixed(2)
      },
      mlClusters: clusterCounts,
      conclusion,
      suggestion
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze performance" });
  }
};
