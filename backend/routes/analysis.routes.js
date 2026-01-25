const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const analysisController = require("../controllers/analysis.controller");

router.get("/user-performance/:email", authMiddleware, analysisController.getUserPerformance);

module.exports = router;
