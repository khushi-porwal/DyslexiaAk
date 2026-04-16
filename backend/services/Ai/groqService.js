const axios = require("axios");

const FALLBACK_MODEL = "llama-3.1-8b-instant";
const REQUESTED_MODEL = process.env.GROQ_MODEL;
const PROHIBITED_MODELS = [
  "llama3-8b-8192",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "mixtral-8x7b",
  "llama-3.1-70b-versatile",
  "llama-3.1-405b-reasoning",
];

const pickModel = () => {
  if (!REQUESTED_MODEL) return FALLBACK_MODEL;
  if (PROHIBITED_MODELS.includes(REQUESTED_MODEL)) return FALLBACK_MODEL;
  return REQUESTED_MODEL;
};

const DEFAULT_MODEL = pickModel();
const BASE_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1";

const groqClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Authorization: process.env.GROQ_API_KEY
      ? `Bearer ${process.env.GROQ_API_KEY}`
      : undefined,
  },
});

const withFallback = async (runner) => {
  try {
    return await runner(DEFAULT_MODEL);
  } catch (err) {
    const code =
      err?.response?.data?.error?.code || err?.response?.status || err?.code;
    if (code === "model_not_found" || code === "model_decommissioned" || code === 404) {
      return runner(FALLBACK_MODEL);
    }
    throw err;
  }
};

const getWritingSuggestion = async (text) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in backend environment");
  }

  const makePayload = (model) => ({
    model,
    temperature: 0.3,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You are a friendly dyslexia writing coach. Keep replies short (under 120 words), simple, and encouraging. Fix spelling and grammar, and give 3 concrete tips.",
      },
      {
        role: "user",
        content: `Student writing:\n${text}\n\nReturn:\n1) A corrected version labeled 'Improved'.\n2) Three bullet tips labeled 'Tips'.`,
      },
    ],
  });

  const data = await withFallback((model) =>
    groqClient.post("/chat/completions", makePayload(model)).then((res) => res.data)
  );

  const message = data?.choices?.[0]?.message?.content?.trim() || "";

  return {
    content: message,
    model: data?.model || DEFAULT_MODEL,
    usage: data?.usage || {},
  };
};

const applyCorrections = (text, corrections = []) => {
  if (!Array.isArray(corrections) || corrections.length === 0) return text;
  const ordered = corrections
    .filter(
      (c) =>
        Number.isFinite(c.start) &&
        Number.isFinite(c.end) &&
        c.start >= 0 &&
        c.end > c.start &&
        c.end <= text.length &&
        typeof c.suggestion === "string"
    )
    .sort((a, b) => a.start - b.start);

  let out = "";
  let cursor = 0;
  ordered.forEach((c) => {
    if (c.start > cursor) out += text.slice(cursor, c.start);
    out += c.suggestion;
    cursor = c.end;
  });
  if (cursor < text.length) out += text.slice(cursor);
  return out;
};

const spellCheck = async (text) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in backend environment");
  }

  const makePayload = (model) => ({
    model,
    temperature: 0,
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a strict spellchecker. Always fix spelling/typos (e.g., 'Aple' -> 'Apple'). Return JSON only with fields: corrected (string), corrections (array of {start,end,original,suggestion} with 0-based offsets on the ORIGINAL text). corrected MUST contain the original text with all suggestions applied. If no errors, return the original text unchanged and an empty array.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const data = await withFallback((model) =>
    groqClient.post("/chat/completions", makePayload(model)).then((res) => res.data)
  );

  const content = data?.choices?.[0]?.message?.content || "{}";
  let parsed = {};
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    parsed = { corrected: text, corrections: [] };
  }

  const corrections = Array.isArray(parsed.corrections)
    ? parsed.corrections
    : [];

  let corrected = parsed.corrected || text;
  const rebuilt = applyCorrections(text, corrections);

  // If the model failed to change the text but we have corrections, trust the rebuilt string.
  if (corrections.length > 0 && corrected === text) {
    corrected = rebuilt;
  }

  return {
    corrected,
    corrections,
    model: data?.model || DEFAULT_MODEL,
  };
};

module.exports = { getWritingSuggestion, spellCheck };
