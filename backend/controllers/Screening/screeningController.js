const ScreeningResult = require("../../models/Screening/ScreeningResult");

const toResponseShape = (doc) => ({
  ...(doc?.data || {}),
  completedAt: doc?.completedAt,
});

// Save or update a user's screening result for a specific test
const saveResult = async (req, res) => {
  try {
    const { testKey, data = {} } = req.body;

    if (!testKey) {
      return res.status(400).json({ message: "testKey is required" });
    }

    const completedAt = data.completedAt || new Date();

    const result = await ScreeningResult.findOneAndUpdate(
      { user: req.userId, testKey },
      { $set: { data, completedAt } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      result: toResponseShape(result),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Fetch all screening results for the authenticated user
const getResults = async (req, res) => {
  try {
    const docs = await ScreeningResult.find({ user: req.userId }).sort({
      updatedAt: -1,
    });

    const results = {};
    docs.forEach((doc) => {
      results[doc.testKey] = toResponseShape(doc);
    });

    return res.json({
      success: true,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { saveResult, getResults };
