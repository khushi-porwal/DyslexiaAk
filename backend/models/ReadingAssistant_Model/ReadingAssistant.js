const mongoose = require("mongoose");

const readingAssistantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["scan", "voice", "translate"],
      required: true,
    },
    confidence: Number,
    language: {
      type: String,
      default: "en",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingAssistant", readingAssistantSchema);
