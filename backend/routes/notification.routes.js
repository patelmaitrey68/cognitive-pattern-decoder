const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

// 📥 Get all notifications for logged-in user
router.get("/notifications", authMiddleware, notificationController.getUserNotifications);

// ✅ Mark a notification as seen
router.put("/notifications/:id/seen", authMiddleware, notificationController.markAsSeen);

module.exports = router;
