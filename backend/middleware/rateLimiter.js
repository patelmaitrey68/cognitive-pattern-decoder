const rateLimit = require("express-rate-limit");

// ===============================
// LOGIN RATE LIMITER
// ===============================
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // max 10 login attempts
  message: {
    error: "Too many login attempts. Please try again later."
  }
});

// ===============================
// SESSION RATE LIMITER
// ===============================
exports.sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // max 100 sessions per hour
  message: {
    error: "Too many session submissions. Please slow down."
  }
});
