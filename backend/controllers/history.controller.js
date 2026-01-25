// const Session = require("../models/Session.model");
// const MLResult = require("../models/MLResult.model");

// exports.getCognitiveHistory = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const history = await MLResult.find({ userId })
//       .populate("projectId", "name type")
//       .populate("sessionId")
//       .sort({ createdAt: -1 });

//     const formatted = history.map(item => ({
//       date: item.createdAt,
//       project: item.projectId?.name,
//       projectType: item.projectId?.type,
//       cluster: item.cluster,
//       sessionTime: item.sessionId?.sessionTime,
//       typingSpeed: item.sessionId?.typingSpeed,
//       backspaceCount: item.sessionId?.backspaceCount,
//       avgPauseTime: item.sessionId?.avgPauseTime
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to load cognitive history" });
//   }
// };
// const Session = require("../models/Session.model");
// const MLResult = require("../models/MLResult.model");

// exports.getCognitiveHistory = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     // Get all sessions sorted by date
//     const sessions = await Session.find({ userId }).sort({ createdAt: 1 });

//     // Get ML results for those sessions
//     const mlResults = await MLResult.find({ userId });

//     const mlMap = {};
//     mlResults.forEach(r => {
//       mlMap[r.sessionId.toString()] = r.cluster;
//     });

//     const history = sessions.map(s => ({
//       date: s.createdAt,
//       typingSpeed: s.typingSpeed,
//       pauseTime: s.avgPauseTime,
//       backspaces: s.backspaceCount,
//       cluster: mlMap[s._id.toString()] ?? null
//     }));

//     res.json(history);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch cognitive history" });
//   }
// };

const MLResult = require("../models/MLResult.model");

exports.getCognitiveHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 🔹 Get ML results with linked project & session
    const history = await MLResult.find({ userId })
      .populate("projectId", "name type")
      .populate("sessionId")
      .sort({ createdAt: -1 });

    if (!history.length) {
      return res.status(200).json({ message: "No cognitive history found" });
    }

    // 🔹 Format response safely
    const formatted = history.map(item => ({
      date: item.createdAt,

      project: item.projectId?.name || "Unknown",
      projectType: item.projectId?.type || "Unknown",

      cluster: item.cluster,

      session: {
        sessionTime: item.sessionId?.sessionTime ?? 0,
        typingSpeed: item.sessionId?.typingSpeed ?? 0,
        backspaceCount: item.sessionId?.backspaceCount ?? 0,
        pasteCount: item.sessionId?.pasteCount ?? 0,
        avgPauseTime: item.sessionId?.avgPauseTime ?? 0,
        saveCount: item.sessionId?.saveCount ?? 0,
        fileSwitchCount: item.sessionId?.fileSwitchCount ?? 0,
        cursorMoveCount: item.sessionId?.cursorMoveCount ?? 0
      }
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Cognitive History Error:", err);
    res.status(500).json({ error: "Failed to load cognitive history" });
  }
};
