const mongoose = require("mongoose");
const User = require("./models/User.model");
const Session = require("./models/Session.model");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ email: "test@example.com" });
  if (!user) {
    console.log("User not found");
    process.exit(0);
  }
  const sessions = await Session.find({ userId: user._id });
  console.log(`Found ${sessions.length} sessions for test@example.com`);
  let totalTyped = 0;
  let totalBackspaces = 0;
  sessions.forEach(s => {
    totalTyped += s.typedChars;
    totalBackspaces += s.backspaceCount;
    console.log(`Session: typed=${s.typedChars}, backspaces=${s.backspaceCount}`);
  });
  console.log(`Total Typed: ${totalTyped}, Total Backspaces: ${totalBackspaces}`);
  const accuracy = totalTyped > 0 
    ? Math.min(100, Math.max(0, Math.round((1 - (totalBackspaces / totalTyped)) * 100))) 
    : 0;
  console.log(`Calculated Accuracy: ${accuracy}%`);
  process.exit(0);
});
