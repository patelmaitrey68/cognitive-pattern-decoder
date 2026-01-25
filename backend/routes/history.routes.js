const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const historyController = require("../controllers/history.controller");

router.get("/cognitive-history", authMiddleware, historyController.getCognitiveHistory);
router.get("/user", authMiddleware, historyController.getCognitiveHistory);
module.exports = router;
