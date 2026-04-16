const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/Auth/authMiddleware");
const {
  upsertProgress,
  listProgress,
} = require("../../controllers/Gamification/progressController");

// Create or update a user's progress for a game
router.post("/", authMiddleware, upsertProgress);

// Fetch all game progress for the authenticated user
router.get("/", authMiddleware, listProgress);

module.exports = router;
