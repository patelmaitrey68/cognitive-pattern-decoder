const Notification = require("../models/Notification.model");

async function checkAndCreateNotification(session, cluster, io) {
  const User = require("../models/User.model");
  const user = await User.findById(session.userId);
  if (!user || !user.settings || !user.settings.notificationsEnabled) return;

  const { settings } = user;

  // 🔴 DISTRACTION
  if (settings.distractionAlerts && cluster === 2 && session.fileSwitchCount > 15) {
    const notif = await Notification.create({
      userId: session.userId,
      type: "distraction",
      message: "You seem distracted with frequent file switching."
    });
    if (io) io.to(session.userId.toString()).emit("new_notification", notif);
  }

  // 🟡 FATIGUE
  if (settings.fatigueAlerts && session.sessionTime > 3600 && session.typingSpeed < 25) {
    const notif = await Notification.create({
      userId: session.userId,
      type: "fatigue",
      message: "Long session detected. Consider taking a break."
    });
    if (io) io.to(session.userId.toString()).emit("new_notification", notif);
  }

  // 🔵 FOCUS
  if (settings.focusCelebrations && cluster === 0 && session.backspaceCount < 10) {
    const notif = await Notification.create({
      userId: session.userId,
      type: "focus",
      message: "Great focus! You're coding efficiently."
    });
    if (io) io.to(session.userId.toString()).emit("new_notification", notif);
  }
}

module.exports = { checkAndCreateNotification };
