const express = require("express");
const {
  writingCoach,
  spellingCoach,
} = require("../../controllers/Ai/aiController");
const optionalAuth = require("../../middleware/Auth/optionalAuth");

const router = express.Router();

router.post("/writing", optionalAuth, writingCoach);
router.post("/spellcheck", optionalAuth, spellingCoach);

module.exports = router;
