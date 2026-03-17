const express = require("express");
const router = express.Router();
const {
  addQuestion,
  getQuestions,
  addBulkQuestions
} = require("../../controllers/WorkingMemory/workingMemoryController");

// admin add
router.post("/add", addQuestion);
router.post("/bulk-add", addBulkQuestions);
// user fetch
router.get("/", getQuestions);

module.exports = router;