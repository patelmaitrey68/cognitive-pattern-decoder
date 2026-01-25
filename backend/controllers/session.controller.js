// const axios = require("axios");
// const Session = require("../models/Session.model");
// const MLResult = require("../models/MLResult.model");
// const { getClusterPrediction } = require("../services/ml.service");
// const { getClusterMeaning } = require("../utils/clusterMeaning");
// const { checkAndCreateNotification } = require("../services/notification.service");


// // ===============================
// // CREATE SESSION
// // ===============================
// exports.createSession = async (req, res) => {
//   try {
//     const {
//       projectId,
//       typingSpeed,
//       typedChars,
//       backspaceCount,
//       pasteCount,
//       pasteCharacters,
//       saveCount,
//       fileSwitchCount,
//       cursorMoveCount,
//       avgPauseTime,
//       sessionTime
//     } = req.body;

//     if (typingSpeed < 0 || typedChars < 0 || backspaceCount < 0 || pasteCount < 0 || avgPauseTime < 0 || sessionTime <= 0) {
//       return res.status(400).json({ error: "Invalid session data" });
//     }

//     const session = new Session({
//       userId: req.user.userId,
//       projectId,
//       typingSpeed,
//       typedChars,
//       backspaceCount,
//       pasteCount,
//       pasteCharacters,
//       saveCount,
//       fileSwitchCount,
//       cursorMoveCount,
//       avgPauseTime,
//       sessionTime
//     });

//     await session.save();

//     res.status(201).json({ message: "Session saved successfully", sessionId: session._id });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to save session" });
//   }
// };


// // ===============================
// // END SESSION → RUN ML + SAVE RESULT
// // ===============================
// exports.endSession = async (req, res) => {
//   try {
//     const session = await Session.findById(req.params.sessionId);

//     if (!session) return res.status(404).json({ msg: "Session not found" });

//     // 🔹 Call ML service
//     const mlResponse = await axios.post("http://127.0.0.1:8000/predict", {
//       typingSpeed: session.typingSpeed,
//       typedChars: session.typedChars,
//       backspaceCount: session.backspaceCount,
//       pasteCount: session.pasteCount,
//       avgPauseTime: session.avgPauseTime,
//       sessionTime: session.sessionTime
//     });

//     const cluster = mlResponse.data.cluster;

//     // 🔹 Save ML Result
//     await MLResult.create({
//       userId: session.userId,
//       projectId: session.projectId,
//       sessionId: session._id,
//       cluster
//     });

//     // 🔔 Trigger notifications
//     await checkAndCreateNotification(session, cluster);

//     res.json({ msg: "Session ended", cluster });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Error ending session" });
//   }
// };


// // ===============================
// // GET SESSIONS BY USER
// // ===============================
// exports.getSessionsByUser = async (req, res) => {
//   const sessions = await Session.find({ userId: req.params.userId });
//   res.json(sessions);
// };


// // ===============================
// // GET SESSIONS BY PROJECT
// // ===============================
// exports.getSessionsByProject = async (req, res) => {
//   const sessions = await Session.find({ projectId: req.params.projectId });
//   res.json(sessions);
// };
// const Session = require("../models/Session.model");
// const MLResult = require("../models/MLResult.model");
// const axios = require("axios");
// const { checkAndCreateNotification } = require("../services/notification.service");

// // ================= CREATE SESSION =================
// exports.createSession = async (req, res) => {
//   try {
//     const {
//       projectId,
//       typingSpeed,
//       typedChars,
//       backspaceCount,
//       pasteCount,
//       pasteCharacters,
//       saveCount,
//       fileSwitchCount,
//       cursorMoveCount,
//       avgPauseTime,
//       sessionTime
//     } = req.body;

//     if (typingSpeed < 0 || typedChars < 0 || backspaceCount < 0 || pasteCount < 0 || avgPauseTime < 0 || sessionTime <= 0) {
//       return res.status(400).json({ error: "Invalid session data" });
//     }

//     const session = new Session({
//       userId: req.user.userId,
//       projectId,
//       typingSpeed,
//       typedChars,
//       backspaceCount,
//       pasteCount,
//       pasteCharacters,
//       saveCount,
//       fileSwitchCount,
//       cursorMoveCount,
//       avgPauseTime,
//       sessionTime
//     });

//     await session.save();

//     res.status(201).json({ message: "Session saved", sessionId: session._id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to save session" });
//   }
// };

// // ================= END SESSION → ML =================
// exports.endSession = async (req, res) => {
//   try {
//     const axios = require("axios");
//     const MLResult = require("../models/MLResult.model");

//     const session = await Session.findById(req.params.sessionId);
//     if (!session) return res.status(404).json({ msg: "Session not found" });

//     const mlResponse = await axios.post("http://127.0.0.1:8000/predict", {
//       typingSpeed: session.typingSpeed,
//       typedChars: session.typedChars,
//       backspaceCount: session.backspaceCount,
//       pasteCount: session.pasteCount,
//       avgPauseTime: session.avgPauseTime,
//       sessionTime: session.sessionTime
//     });

//     const cluster = mlResponse.data.cluster;

//     await MLResult.create({
//       userId: session.userId,
//       projectId: session.projectId,
//       sessionId: session._id,
//       cluster
//     });

//     res.json({ msg: "Session ended", mlCluster: cluster });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Error ending session" });
//   }
// };

// exports.getCognitiveHistory = async (req, res) => {
//   try {
//     const MLResult = require("../models/MLResult.model");

//     const history = await MLResult.find({ userId: req.user.userId })
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
const Session = require("../models/Session.model");
const MLResult = require("../models/MLResult.model");
const axios = require("axios");

// ===============================
// CREATE SESSION
// ===============================
exports.createSession = async (req, res) => {
  try {
    const {
      projectId,
      typingSpeed,
      typedChars,
      backspaceCount,
      pasteCount,
      pasteCharacters,
      saveCount,
      fileSwitchCount,
      cursorMoveCount,
      avgPauseTime,
      sessionTime
    } = req.body;

    // 🔐 Validation
    if (
      typingSpeed < 0 ||
      typedChars < 0 ||
      backspaceCount < 0 ||
      pasteCount < 0 ||
      avgPauseTime < 0 ||
      sessionTime <= 0
    ) {
      return res.status(400).json({ error: "Invalid session data" });
    }

    const session = new Session({
      userId: req.user.userId,
      projectId,
      typingSpeed,
      typedChars,
      backspaceCount,
      pasteCount,
      pasteCharacters,
      saveCount,
      fileSwitchCount,
      cursorMoveCount,
      avgPauseTime,
      sessionTime
    });

    await session.save();

    res.status(201).json({
      message: "Session saved",
      sessionId: session._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save session" });
  }
};

// ===============================
// END SESSION (ML)
// ===============================
exports.endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const mlResponse = await axios.post("http://localhost:8000/predict", {
      typingSpeed: session.typingSpeed,
      typedChars: session.typedChars,
      backspaceCount: session.backspaceCount,
      pasteCount: session.pasteCount,
      avgPauseTime: session.avgPauseTime,
      sessionTime: session.sessionTime
    });

    const cluster = mlResponse.data.cluster;

    const mlResult = await MLResult.create({
      userId: session.userId,
      projectId: session.projectId,
      sessionId: session._id,
      cluster
    });

    await checkAndCreateNotification(session, cluster);

    res.json({ msg: "Session ended", mlCluster: cluster });

  }  catch (error) {
  console.error("ML ERROR:", error.response?.data || error.message);
  res.status(500).json({ msg: "ML processing failed", error: error.message });
}
};


// ===============================
// GET SESSIONS BY USER
// ===============================
exports.getSessionsByUser = async (req, res) => {
  const sessions = await Session.find({ userId: req.params.userId });
  res.json(sessions);
};

// ===============================
// GET SESSIONS BY PROJECT
// ===============================
exports.getSessionsByProject = async (req, res) => {
  const sessions = await Session.find({ projectId: req.params.projectId });
  res.json(sessions);
};

// ===============================
// COGNITIVE HISTORY
// ===============================
exports.getCognitiveHistory = async (req, res) => {
  const history = await MLResult.find({ userId: req.user.userId })
    .populate("projectId", "name type")
    .populate("sessionId")
    .sort({ createdAt: -1 });

  res.json(history);
};
