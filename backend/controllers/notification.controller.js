const Notification = require("../models/Notification.model");

exports.getUserNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.userId })
    .sort({ createdAt: -1 });

  res.json(notifications);
};

exports.markAsSeen = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { seen: true });
  res.json({ msg: "Marked as seen" });
};
