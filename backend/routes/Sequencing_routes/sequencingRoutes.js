const express = require("express");
const router = express.Router();
const auth = require("../../middleware/Auth/authMiddleware");
const {
  recordEvent,
  getLogs,
} = require("../../controllers/Sequencing/sequencingController");

router.post("/log", auth, recordEvent);
router.get("/logs", auth, getLogs);

module.exports = router;
