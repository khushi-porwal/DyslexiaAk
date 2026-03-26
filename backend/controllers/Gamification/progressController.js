const GameProgress = require("../../models/Gamification_Model/GameProgress");

// Upsert a user's progress for a specific game
const upsertProgress = async (req, res) => {
  try {
    const { gameId, score = 0, completed = false, metadata = {}, updatedAt } =
      req.body;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const progress = await GameProgress.findOneAndUpdate(
      { user: req.userId, gameId },
      {
        $set: {
          score,
          completed,
          metadata,
          lastUpdatedClientAt: updatedAt || new Date(),
        },
        $setOnInsert: {
          user: req.userId,
          gameId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      progress: {
        [gameId]: {
          score: progress.score,
          completed: progress.completed,
          updatedAt: progress.lastUpdatedClientAt || progress.updatedAt,
          metadata: progress.metadata || {},
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Return all progress entries for the authenticated user
const listProgress = async (req, res) => {
  try {
    const docs = await GameProgress.find({ user: req.userId }).lean();

    const progress = docs.reduce((acc, item) => {
      acc[item.gameId] = {
        score: item.score,
        completed: item.completed,
        updatedAt: item.lastUpdatedClientAt || item.updatedAt,
        metadata: item.metadata || {},
      };
      return acc;
    }, {});

    return res.json({ success: true, progress });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { upsertProgress, listProgress };
