
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    activityType: {
      type: String,
      required: true,
      enum: [
        "grey_reading",
        "phonological",
        "working_memory",
        "rapid_writing",
        "reading_assistant",
      ],
    },

    duration: {
      type: Number, // seconds
      required: true,
    },

    score: {
      type: Number, // optional if later needed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
