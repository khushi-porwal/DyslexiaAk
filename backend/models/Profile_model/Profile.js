const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
  },
  username: String,
  email: String,
  phone: String,
  birthday: String,
  bio: String,
  avatar: String,
});

module.exports = mongoose.model("Profile", profileSchema);
