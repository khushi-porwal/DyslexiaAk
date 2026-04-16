const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0, // seconds
    },
    completed: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

gameSessionSchema.index({ user: 1, playedAt: -1 });
gameSessionSchema.index({ user: 1, gameName: 1, playedAt: -1 });

module.exports = mongoose.model("GameSession", gameSessionSchema);
