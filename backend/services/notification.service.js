const Notification = require("../models/Notification.model");

async function checkAndCreateNotification(session, cluster) {
  // 🔴 DISTRACTION
  if (cluster === 2 && session.fileSwitchCount > 15) {
    await Notification.create({
      userId: session.userId,
      type: "distraction",
      message: "You seem distracted with frequent file switching."
    });
  }

  // 🟡 FATIGUE
  if (session.sessionTime > 3600 && session.typingSpeed < 25) {
    await Notification.create({
      userId: session.userId,
      type: "fatigue",
      message: "Long session detected. Consider taking a break."
    });
  }

  // 🔵 FOCUS
  if (cluster === 0 && session.backspaceCount < 10) {
    await Notification.create({
      userId: session.userId,
      type: "focus",
      message: "Great focus! You're coding efficiently."
    });
  }
}

module.exports = { checkAndCreateNotification };
