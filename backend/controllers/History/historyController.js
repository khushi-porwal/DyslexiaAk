const History = require("../../models/History/History");
const ScreeningResult = require("../../models/Screening/ScreeningResult");

// Save a single history event
const createHistory = async (req, res) => {
  try {
    const { activityType, duration, score } = req.body;

    const history = new History({
      user: req.userId, // from authMiddleware
      activityType,
      duration,
      score,
    });

    await history.save();

    res.status(201).json({
      success: true,
      message: "History saved",
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Simple status to block progress/analysis for brand‑new users
const getProgressStatus = async (req, res) => {
  try {
    const count = await ScreeningResult.countDocuments({ user: req.userId });

    if (count === 0) {
      return res.json({
        success: true,
        requiresScreening: true,
        canViewAnalysis: false,
        message: "Please complete at least one screening before viewing analysis.",
      });
    }

    return res.json({
      success: true,
      requiresScreening: false,
      canViewAnalysis: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createHistory, getProgressStatus };
