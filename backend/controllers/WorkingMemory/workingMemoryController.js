const WorkingMemory = require("../../models/WorkingMemory_Model/WorkingMemory");

// Add question (Admin)
exports.addQuestion = async (req, res) => {
  try {
    const question = await WorkingMemory.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all questions (User)
exports.getQuestions = async (req, res) => {
  try {
    const questions = await WorkingMemory.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk add questions
exports.addBulkQuestions = async (req, res) => {
  try {
    const questions = await WorkingMemory.insertMany(req.body);
    res.status(201).json({
      message: "Bulk questions added successfully",
      count: questions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    const questions = await WorkingMemory.find(filter);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
