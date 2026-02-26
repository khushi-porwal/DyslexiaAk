const express = require("express");
const router = express.Router();

const { createHistory } = require("../../controllers/History/historyController");
const authMiddleware = require("../../middleware/Auth/authMiddleware");

// POST history
router.post("/history", authMiddleware, createHistory);

module.exports = router;