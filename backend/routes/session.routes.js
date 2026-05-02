// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/auth.middleware");
// const sessionController = require("../controllers/session.controller");

// // ✅ Create session
// router.post(
//   "/",
//   authMiddleware,
//   sessionController.createSession
// );

// // ✅ End session (ML + save result)
// router.post(
//   "/end/:sessionId",
//   authMiddleware,
//   sessionController.endSession
// );

// // ✅ Get sessions by user
// router.get(
//   "/user/:userId",
//   authMiddleware,
//   sessionController.getSessionsByUser
// );

// // ✅ Get sessions by project
// router.get(
//   "/project/:projectId",
//   authMiddleware,
//   sessionController.getSessionsByProject
// );

// // ✅ Cognitive history
// router.get(
//   "/history",
//   authMiddleware,
//   sessionController.getCognitiveHistory
// );

// module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const sessionController = require("../controllers/session.controller");

// ✅ Create session
router.post("/", authMiddleware, sessionController.createSession);

// ✅ End session (ML + result save)
router.post("/end/:sessionId", authMiddleware, sessionController.endSession);

// ✅ Get sessions by user
router.get("/user/:userId", authMiddleware, sessionController.getSessionsByUser);

// ✅ Get sessions by project
router.get("/project/:projectId", authMiddleware, sessionController.getSessionsByProject);

// ✅ Cognitive history
// Redundant route removed. Use /api/history/cognitive-history instead.
router.get("/dashboard", authMiddleware, sessionController.getDashboardSummary);
module.exports = router;
