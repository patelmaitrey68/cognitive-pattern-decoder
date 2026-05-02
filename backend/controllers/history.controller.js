const Session = require("../models/Session.model");
const MLResult = require("../models/MLResult.model");

const clusterMeanings = {
  0: "Systematic Thinker",
  1: "Creative Coder",
  2: "Analytical Processor",
  3: "Intuitive Developer",
  4: "Methodical Planner",
};

exports.getCognitiveHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await Session.find({ userId })
      .populate("projectId", "name type")
      .sort({ createdAt: -1 });

    console.log(`History: Found ${sessions.length} sessions for user ${userId}`);

    const sessionIds = sessions.map(s => s._id);
    const mlResults = await MLResult.find({ sessionId: { $in: sessionIds } });

    const mlMap = {};
    mlResults.forEach(ml => {
      mlMap[ml.sessionId.toString()] = ml.cluster;
    });

    const formatted = sessions.map(s => {
      const cluster = mlMap[s._id.toString()] ?? null;
      return {
        _id: s._id,
        date: s.createdAt,
        project: s.projectId?.name || "Global Session",
        projectType: s.projectId?.type || "General",
        cluster: cluster,
        clusterMeaning: cluster !== null ? clusterMeanings[cluster] : "Analyzing...",
        wpm: Math.round((s.typingSpeed ?? 0) * 12),
        duration: (s.sessionTime ?? 0) * 1000, // Frontend expects ms
        backspaces: s.backspaceCount ?? 0,
        fileSwitches: s.fileSwitchCount ?? 0,
        pasteCount: s.pasteCount ?? 0,
        avgPauseTime: s.avgPauseTime ?? 0,
        saves: s.saveCount ?? 0,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Cognitive History Error:", err);
    res.status(500).json({ error: "Failed to load cognitive history from Atlas" });
  }
};
