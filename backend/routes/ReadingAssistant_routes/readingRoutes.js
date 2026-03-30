const express = require("express");
const multer = require("multer");
const {
  scanImage,
  transcribeAudio,
  translateText,
} = require("../../controllers/ReadingAssistant/readingController");
const authMiddleware = require("../../middleware/Auth/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
});

router.post("/scan", authMiddleware, upload.single("image"), scanImage);
router.post("/transcribe", authMiddleware, upload.single("audio"), transcribeAudio);
router.post("/translate", authMiddleware, translateText);

module.exports = router;
