 const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["DSA", "WEB", "ML", "DEBUG","mobile","dsa","defult","web","ml","debug","mobile"],
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", ProjectSchema);
// Note: The 'owner' field has been renamed to 'userId' for clarity and consistency.
  //module.exports = mongoose.model("Project", ProjectSchema);
