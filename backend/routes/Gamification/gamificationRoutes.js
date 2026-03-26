const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/Auth/authMiddleware");
const {
  createSession,
  getSessions,
  getSummary,
} = require("../../controllers/Gamification/gamificationController");

// Record a gameplay session for the authenticated user
router.post("/sessions", authMiddleware, createSession);

// List recent sessions for the authenticated user (optional ?gameName=&limit=)
router.get("/sessions", authMiddleware, getSessions);

// Aggregate per-game stats for the authenticated user
router.get("/summary", authMiddleware, getSummary);

module.exports = router;
