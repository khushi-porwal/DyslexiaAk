const express = require("express");
const router = express.Router();

const {
  submitPhonologicalTest
} = require("../../controllers/Phonological/phonologicalController");

// ✅ POST: submit test
router.post("/submit", submitPhonologicalTest);

module.exports = router;
