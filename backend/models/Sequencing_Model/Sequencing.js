const mongoose = require("mongoose");

const sequencingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routineTitle: {
      type: String,
      required: true,
      trim: true,
    },
    steps: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    action: {
      type: String,
      enum: ["started", "step", "completed", "noted"],
      default: "step",
    },
    currentStepIndex: {
      type: Number,
      default: 0,
    },
    currentStepText: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SequencingLog", sequencingSchema);
