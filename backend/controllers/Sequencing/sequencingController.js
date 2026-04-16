const SequencingLog = require("../../models/Sequencing_Model/Sequencing");

// Record a sequencing interaction (start/step/complete)
exports.recordEvent = async (req, res) => {
  try {
    const {
      routineTitle,
      steps = [],
      currentStepIndex = 0,
      action = "step",
      notes = "",
    } = req.body || {};

    if (!routineTitle || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "routineTitle and steps are required.",
      });
    }

    const safeIndex = Number.isInteger(currentStepIndex)
      ? currentStepIndex
      : 0;

    const doc = await SequencingLog.create({
      userId: req.userId,
      routineTitle,
      steps,
      action,
      currentStepIndex: safeIndex,
      currentStepText: steps[safeIndex] || "",
      notes,
    });

    return res.json({ success: true, log: doc });
  } catch (error) {
    console.error("Sequencing record error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save sequencing event",
      error: error.message,
    });
  }
};

// Return recent sequencing logs for the authenticated user
exports.getLogs = async (req, res) => {
  try {
    const logs = await SequencingLog.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, logs });
  } catch (error) {
    console.error("Sequencing list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load sequencing events",
      error: error.message,
    });
  }
};
