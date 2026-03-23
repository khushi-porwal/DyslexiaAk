const express = require("express");
const router = express.Router();

const {
  createHistory,
  getProgressStatus,
} = require("../../controllers/History/historyController");
const authMiddleware = require("../../middleware/Auth/authMiddleware");

// POST history
router.post("/history", authMiddleware, createHistory);

// GET progress status (blocks analysis for new users)
router.get("/history/status", authMiddleware, getProgressStatus);

module.exports = router;
