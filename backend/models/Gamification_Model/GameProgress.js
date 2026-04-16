const mongoose = require("mongoose");

const gameProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastUpdatedClientAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

gameProgressSchema.index({ user: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model("GameProgress", gameProgressSchema);
