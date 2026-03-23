const express = require("express");
const { saveResult, getResults } = require("../../controllers/Screening/screeningController");
const authMiddleware = require("../../middleware/Auth/authMiddleware");

const router = express.Router();

// Save or update a screening result for the logged-in user
router.post("/results", authMiddleware, saveResult);

// Get all screening results for the logged-in user
router.get("/results", authMiddleware, getResults);

module.exports = router;
