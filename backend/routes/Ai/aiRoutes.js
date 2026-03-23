const express = require("express");
const { writingCoach, spellingCoach } = require("../../controllers/Ai/aiController");

const router = express.Router();

router.post("/writing", writingCoach);
router.post("/spellcheck", spellingCoach);

module.exports = router;
