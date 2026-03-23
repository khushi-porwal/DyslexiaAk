const express = require("express");
const multer = require("multer");
const {
  scanImage,
  transcribeAudio,
  translateText,
} = require("../../controllers/ReadingAssistant/readingController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max
  },
});

router.post("/scan", upload.single("image"), scanImage);
router.post("/transcribe", upload.single("audio"), transcribeAudio);
router.post("/translate", translateText);

module.exports = router;
