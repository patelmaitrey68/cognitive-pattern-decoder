const User = require("../models/User.model");
const Session = require("../models/Session.model");
const MLResult = require("../models/MLResult.model");

// 📊 Helper to calculate user aggregate stats
const calculateUserAggregates = async (userId) => {
  const sessions = await Session.find({ userId });
  if (sessions.length === 0) return null;

  const totalTyped = sessions.reduce((sum, s) => sum + s.typedChars, 0);
  const totalBackspaces = sessions.reduce((sum, s) => sum + s.backspaceCount, 0);
  
  const avgWpm = Math.round(
    (sessions.reduce((sum, s) => sum + s.typingSpeed, 0) / sessions.length) * 12
  );
  const accuracy = totalTyped > 0 
    ? Math.round((totalTyped / (totalTyped + totalBackspaces)) * 100)
    : 0;
  
  const avgPause = sessions.reduce((sum, s) => sum + s.avgPauseTime, 0) / sessions.length;
  // Thinking factor: lower pause time relative to typing speed is better for "flow" 
  // but higher pause can mean "methodical". Let's call it "Efficiency"
  const efficiency = Math.min(100, Math.max(0, Math.round(100 - (avgPause * 5))));

  // Get most common cluster
  const mlResults = await MLResult.find({ userId });
  const clusters = mlResults.map(r => r.clusterMeaning).filter(Boolean);
  const dominantStyle = clusters.length > 0 
    ? clusters.sort((a,b) =>
        clusters.filter(v => v===a).length - clusters.filter(v => v===b).length
      ).pop()
    : "Developing Coder";

  return {
    avgWpm,
    accuracy,
    efficiency,
    totalSessions: sessions.length,
    dominantStyle,
    score: (avgWpm * 0.3) + (accuracy * 0.4) + (efficiency * 0.3)
  };
};

// 📊 Compare two users
exports.compareUser = async (req, res) => {
  try {
    const { email } = req.query;
    const currentUserId = req.user.userId;

    if (!email) {
      return res.status(400).json({ error: "Email query is required" });
    }

    // 🔎 Find target user by email
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ error: "User with this email not found" });
    }

    if (targetUser._id.toString() === currentUserId.toString()) {
      return res.status(400).json({ error: "You cannot compare yourself with yourself." });
    }

    // 📁 Fetch stats for both
    const selfStats = await calculateUserAggregates(currentUserId);
    const peerStats = await calculateUserAggregates(targetUser._id);

    if (!selfStats) {
      return res.status(400).json({ error: "No session data found for your account. Start coding first!" });
    }
    if (!peerStats) {
      return res.status(404).json({ error: `User ${email} has no recorded coding sessions yet.` });
    }

    // 🏆 Determine Leader
    const leader = selfStats.score >= peerStats.score ? "You" : targetUser.name || targetUser.email;

    // 📝 Dynamic growth narrative (Competitive Coaching)
    let growthNarrative = "";
    const wpmDiff = Math.abs(selfStats.avgWpm - peerStats.avgWpm);
    const accDiff = Math.abs(selfStats.accuracy - peerStats.accuracy);

    if (selfStats.score >= peerStats.score) {
      growthNarrative = `You are currently outperforming ${targetUser.name || 'your peer'} in overall cognitive efficiency. `;
      if (selfStats.avgWpm > peerStats.avgWpm) {
        growthNarrative += `Your implementation speed is ${wpmDiff} WPM higher, giving you a significant technical lead. `;
      }
      growthNarrative += `Don't get complacent—sustain this level of precision to maintain your professional edge.`;
    } else {
      growthNarrative = `${targetUser.name || 'Your peer'} is currently leading with a more optimized coding flow. `;
      if (peerStats.avgWpm > selfStats.avgWpm) {
        growthNarrative += `They are outpacing you by ${wpmDiff} WPM. `;
      }
      if (peerStats.accuracy > selfStats.accuracy) {
        growthNarrative += `Their precision is ${accDiff}% higher, suggesting a more methodical implementation strategy. `;
      }
      growthNarrative += `Analyze their pattern archtype to see where you can tighten your own logic.`;
    }







    // 🎯 Challenges (Actionable & Competitive)
    const challenges = [];
    if (selfStats.avgWpm < peerStats.avgWpm) {
      challenges.push(`Speed Rivalry: Close the ${wpmDiff} WPM gap by hitting a target of ${peerStats.avgWpm + 2} WPM in your next session.`);
    }
    if (selfStats.accuracy < peerStats.accuracy) {
      challenges.push(`Precision Duel: Match or exceed their ${peerStats.accuracy}% accuracy rating to prove your implementation depth.`);
    }
    if (selfStats.efficiency < peerStats.efficiency) {
      challenges.push(`Flow Mastery: Reduce your average pause time to match their high cognitive efficiency score.`);
    }
    
    if (challenges.length === 0) {
      challenges.push("Domination: You are leading in all key metrics. Challenge yourself to maintain this 100% win rate for the next 5 sessions.");
    }
    
    res.json({
      self: {
        name: req.user.name || "You",
        email: req.user.email,
        stats: selfStats
      },
      peer: {
        name: targetUser.name || "Peer",
        email: targetUser.email,
        stats: peerStats
      },
      leader,
      growthNarrative,
      challenges
    });

  } catch (error) {
    console.error("Compare User Error:", error);
    res.status(500).json({ error: "Failed to perform user comparison" });
  }
};
