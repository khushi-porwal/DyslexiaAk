const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  birthday: String,
  bio: String,
  avatar: String,
});

module.exports = mongoose.model("Profile", profileSchema);
