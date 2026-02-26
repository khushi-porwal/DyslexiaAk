const mongoose = require("mongoose");

const phonologicalSchema = new mongoose.Schema(
  {
    // TASK 1: rhyme
    selectedWords: {
      type: [String],
      required: true,
      default: [],
    },

    // TASK 2: syllables
    syllableCount: {
      type: Number,
      required: true,
    },

    // TASK 3: letters
    letterCount: {
      type: Number,
      required: true,
    },

    // TASK 4: first sound
    firstSound: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // TASK 5: last sound
    lastSound: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // TASK 6: blending
    blendedWord: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // total score
    score: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Phonological", phonologicalSchema);
