const mongoose = require("mongoose");

const screeningResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    testKey: {
      type: String,
      required: true,
      enum: [
        "phonological",
        "grey_reading",
        "working_memory",
        "rapid_automation",
      ],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

screeningResultSchema.index({ user: 1, testKey: 1 }, { unique: true });

module.exports = mongoose.model("ScreeningResult", screeningResultSchema);
