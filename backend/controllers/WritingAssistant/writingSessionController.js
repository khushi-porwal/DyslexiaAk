const WritingSession = require("../../models/WritingAssistant_Model/WritingAssistant");

const parseSuggestion = (content = "") => {
  const improvedMatch = content.match(
    /Improved\s*:?\s*([\s\S]*?)(?:\n\s*Tips\s*:|Tips\s*:|$)/i
  );
  const tipsMatch = content.match(/Tips\s*:?\s*([\s\S]*)/i);

  const improvedText = improvedMatch ? improvedMatch[1].trim() : "";

  const tips = tipsMatch
    ? tipsMatch[1]
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-\u2022\d.)\s]+/, "").trim())
        .filter(Boolean)
    : [];

  return { improvedText, tips };
};

const saveWritingSession = async ({
  userId,
  originalText,
  suggestion,
  correctedText,
  corrections,
  metadata,
}) => {
  if (!suggestion || !suggestion.content) {
    throw new Error("Suggestion content is required to save a session");
  }

  const { improvedText, tips } = parseSuggestion(suggestion.content);

  const session = await WritingSession.create({
    user: userId || null,
    originalText,
    improvedText,
    tips,
    rawResponse: suggestion.content,
    correctedText: correctedText || "",
    corrections: Array.isArray(corrections) ? corrections : [],
    model: suggestion.model,
    usage: suggestion.usage,
    metadata,
  });

  return session;
};

const getMySessions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const sessions = await WritingSession.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await WritingSession.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    return res.json({ success: true, session });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const deleted = await WritingSession.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    return res.json({
      success: true,
      message: "Session deleted",
      sessionId: deleted._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  parseSuggestion,
  saveWritingSession,
  getMySessions,
  getSessionById,
  deleteSession,
};
