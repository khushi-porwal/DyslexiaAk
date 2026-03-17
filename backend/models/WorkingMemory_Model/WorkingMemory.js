const mongoose = require("mongoose");

const workingMemorySchema = new mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },
  category: {
    type: String,
    default: "general"
  }
});

module.exports = mongoose.model("WorkingMemory", workingMemorySchema);