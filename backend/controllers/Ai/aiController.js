const { getWritingSuggestion } = require("../../services/Ai/groqService");
const { spellCheck } = require("../../services/Ai/groqService");

const writingCoach = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const suggestion = await getWritingSuggestion(text.trim());

    return res.json(suggestion);
  } catch (error) {
    console.error("Groq writing assistant error:", error.message || error.code);

    const status =
      error.response?.status ||
      (error.code === "EACCES" ? 503 : undefined) ||
      500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      (error.code === "EACCES"
        ? "Backend cannot reach Groq (network blocked or denied)."
        : "Unable to process request");

    // Normalize auth errors so the client doesn't leak Groq details
    if (status === 401) {
      return res.status(500).json({
        message:
          "Groq API authentication failed. Check GROQ_API_KEY on the backend.",
      });
    }

    return res.status(status).json({ message });
  }
};

const spellingCoach = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const result = await spellCheck(text.trim());
    return res.json(result);
  } catch (error) {
    console.error("Groq spellcheck error:", error.message || error.code);
    const status =
      error.response?.status ||
      (error.code === "EACCES" ? 503 : undefined) ||
      500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      (error.code === "EACCES"
        ? "Backend cannot reach Groq (network blocked or denied)."
        : "Unable to spellcheck");

    if (status === 401) {
      return res.status(500).json({
        message:
          "Groq API authentication failed. Check GROQ_API_KEY on the backend.",
      });
    }

    return res.status(status).json({ message });
  }
};

module.exports = { writingCoach, spellingCoach };
