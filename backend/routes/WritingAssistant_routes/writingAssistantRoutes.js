const express = require("express");
const authMiddleware = require("../../middleware/Auth/authMiddleware");
const {
  getMySessions,
  getSessionById,
  deleteSession,
} = require("../../controllers/WritingAssistant/writingSessionController");

const router = express.Router();

// User-scoped history
router.get("/history", authMiddleware, getMySessions);
router.get("/history/:id", authMiddleware, getSessionById);
router.delete("/history/:id", authMiddleware, deleteSession);

module.exports = router;
