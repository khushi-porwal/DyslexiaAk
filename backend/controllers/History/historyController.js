const History = require("../../models/History/History");

const createHistory = async (req, res) => {
  try {
    const { activityType, duration, score } = req.body;

    const history = new History({
      user: req.userId,   // coming from authMiddleware
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

module.exports = { createHistory };