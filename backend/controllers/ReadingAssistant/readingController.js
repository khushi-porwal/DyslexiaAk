const fs = require("fs");
const os = require("os");
const path = require("path");
const Groq = require("groq-sdk");
const Tesseract = require("tesseract.js");

const groqApiKey = process.env.GROQ_API_KEY;
const groq =
  groqApiKey && groqApiKey !== "your_groq_api_key_here"
    ? new Groq({ apiKey: groqApiKey })
    : null;

const ensureGroq = () => {
  if (!groq) {
    throw new Error(
      "GROQ_API_KEY is missing. Add it to your backend .env to enable voice/translation."
    );
  }
};

const saveTempFile = async (buffer, extension) => {
  const filePath = path.join(
    os.tmpdir(),
    `reading-assistant-${Date.now()}.${extension}`
  );
  await fs.promises.writeFile(filePath, buffer);
  return filePath;
};

exports.scanImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required." });
    }

    const { data } = await Tesseract.recognize(req.file.buffer, "eng");
    const text = data?.text?.trim() || "";

    return res.json({
      success: true,
      text,
      confidence: data?.confidence || null,
    });
  } catch (error) {
    console.error("Image scan error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to scan image",
      error: error.message,
    });
  }
};

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Audio file is required." });
    }

    ensureGroq();

    const extension =
      req.file.originalname?.split(".").pop()?.toLowerCase() || "wav";
    const tempPath = await saveTempFile(req.file.buffer, extension);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-large-v3",
      response_format: "json",
    });

    await fs.promises.unlink(tempPath);

    return res.json({
      success: true,
      text: transcription.text?.trim() || "",
    });
  } catch (error) {
    console.error("Audio transcription error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to transcribe audio",
      error: error.message,
    });
  }
};

exports.translateText = async (req, res) => {
  try {
    const { text, targetLang = "en" } = req.body || {};

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required for translation." });
    }

    ensureGroq();

    const requestedModel = process.env.GROQ_MODEL;
    const fallbackModel = "llama-3.1-8b-instant";
    const prohibited = [
      "llama3-8b-8192",
      "llama3-70b-8192",
      "mixtral-8x7b-32768",
      "mixtral-8x7b",
      "llama-3.1-70b-versatile",
      "llama-3.1-405b-reasoning" // restricted for many accounts
    ];

    const pickModel = () => {
      if (!requestedModel) return fallbackModel;
      if (prohibited.includes(requestedModel)) return fallbackModel;
      return requestedModel;
    };

    const runCompletion = async (modelId) =>
      groq.chat.completions.create({
        model: modelId,
        messages: [
          {
            role: "system",
            content:
              "You are a concise translator. Keep names and proper nouns unchanged. Return only the translated text.",
          },
          {
            role: "user",
            content: `Translate this to ${targetLang}: ${text}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

    let completion;
    const firstModel = pickModel();
    try {
      completion = await runCompletion(firstModel);
    } catch (err) {
      // If model not found/decommissioned, retry with safe default
      if (
        err?.response?.data?.error?.code === "model_not_found" ||
        err?.response?.data?.error?.code === "model_decommissioned"
      ) {
        completion = await runCompletion(fallbackModel);
      } else {
        throw err;
      }
    }

    const translated =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "Unable to translate right now.";

    return res.json({
      success: true,
      text: translated,
    });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to translate text",
      error: error.message,
    });
  }
};
