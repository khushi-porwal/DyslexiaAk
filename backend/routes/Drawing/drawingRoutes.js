const express = require("express");
const { checkDrawing } = require("../../controllers/Drawing/drawingController");

const router = express.Router();

router.post("/check", checkDrawing);

module.exports = router;