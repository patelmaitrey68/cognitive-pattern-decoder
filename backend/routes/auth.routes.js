const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { loginLimiter } = require("../middleware/rateLimiter");

const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller"); // ✅ ADD THIS
const upload = require("../middleware/upload.middleware");
const { updateProfile } = require("../controllers/auth.controller");



router.put(
  "/update",
  authMiddleware,
  updateProfile
);



// 🔐 LOGIN WITH RATE LIMITING
router.post("/login", loginLimiter, authController.login);

// 🔐 REGISTER USER
router.post("/register", authController.register);

// 🔄 REFRESH TOKEN
router.post("/refresh", authController.refreshToken);

// 🚪 LOGOUT
router.post("/logout", authController.logout);

// 👤 COMPARE USER (Protected Route)
router.get("/compare", authMiddleware, userController.compareUser);

module.exports = router;
