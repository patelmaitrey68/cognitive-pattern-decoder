const mongoose = require("mongoose");
const User = require("./models/User.model");
const Session = require("./models/Session.model");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: "test@example.com" });
  const sessions = await Session.find({ userId: user._id }).sort({ createdAt: 1 });
  const latest = sessions[sessions.length - 1];
  console.log(`Latest session: typed=${latest.typedChars}, backspaces=${latest.backspaceCount}`);
  
  const accuracy = (latest.typedChars > 0)
    ? Math.min(100, Math.max(0, Math.round(((latest.typedChars - latest.backspaceCount) / latest.typedChars) * 100)))
    : 0;
  console.log(`Dashboard Accuracy for latest session: ${accuracy}%`);
  process.exit(0);
});
