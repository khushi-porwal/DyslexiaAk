const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
  {
    prompt_tokens: Number,
    completion_tokens: Number,
    total_tokens: Number,
  },
  { _id: false }
);

const correctionSchema = new mongoose.Schema(
  {
    start: Number,
    end: Number,
    original: String,
    suggestion: String,
  },
  { _id: false }
);

const metaSchema = new mongoose.Schema(
  {
    client: String,
    ip: String,
  },
  { _id: false }
);

const writingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    originalText: {
      type: String,
      required: true,
      trim: true,
    },
    improvedText: {
      type: String,
      default: "",
    },
    tips: {
      type: [String],
      default: [],
    },
    rawResponse: {
      type: String,
      required: true,
    },
    correctedText: {
      type: String,
      default: "",
    },
    corrections: {
      type: [correctionSchema],
      default: [],
    },
    model: String,
    usage: {
      type: usageSchema,
      default: undefined,
    },
    source: {
      type: String,
      enum: ["writing"],
      default: "writing",
    },
    metadata: {
      type: metaSchema,
      default: undefined,
    },
  },
  { timestamps: true }
);

writingSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("WritingSession", writingSessionSchema);
