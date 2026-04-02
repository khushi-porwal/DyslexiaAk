const mongoose = require("mongoose");
const GameSession = require("../../models/Gamification_Model/GameSession");

// Record a single gameplay session for the authenticated user
const createSession = async (req, res) => {
  try {
    const {
      gameName,
      score = 0,
      duration = 0,
      completed = false,
      metadata = {},
      playedAt,
    } = req.body;

    if (!gameName) {
      return res.status(400).json({
        success: false,
        message: "gameName is required",
      });
    }

    const session = await GameSession.create({
      user: req.userId,
      gameName,
      score,
      duration,
      completed,
      metadata,
      playedAt: playedAt ? new Date(playedAt) : new Date(),
    });

    return res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// List recent sessions for the authenticated user (optionally filtered by game)
const getSessions = async (req, res) => {
  try {
    const { gameName } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const filter = { user: req.userId };
    if (gameName) filter.gameName = gameName;

    const sessions = await GameSession.find(filter)
      .sort({ playedAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Aggregate per-game stats for the authenticated user
const getSummary = async (req, res) => {
  try {
    const summary = await GameSession.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: "$gameName",
          plays: { $sum: 1 },
          bestScore: { $max: "$score" },
          avgScore: { $avg: "$score" },
          totalDuration: { $sum: "$duration" },
          lastPlayed: { $max: "$playedAt" },
          completedCount: {
            $sum: {
              $cond: ["$completed", 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          gameName: "$_id",
          plays: 1,
          bestScore: { $ifNull: ["$bestScore", 0] },
          avgScore: { $ifNull: ["$avgScore", 0] },
          totalDuration: 1,
          lastPlayed: 1,
          completedCount: 1,
        },
      },
      { $sort: { gameName: 1 } },
    ]);

    return res.json({
      success: true,
      summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createSession, getSessions, getSummary };
