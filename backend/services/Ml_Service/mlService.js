const axios = require("axios");

const sendToML = async (image, target) => {
  const mlUrl = process.env.ML_URL || "http://localhost:8000";
  try {
    const response = await axios.post(
      `${mlUrl}/predict`,
      { image, target },
      {
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024, // 50MB for large base64 (e.g. from Android)
        maxBodyLength: 50 * 1024 * 1024,
      }
    );
    return response.data;
  } catch (err) {
    const code = err.code || err.response?.status;
    const message =
      err.response?.data?.message ||
      err.message ||
      "ML service unreachable";
    // Graceful fallback so frontend gets a clear message
    return {
      success: false,
      message: "Drawing service unavailable. Model not loaded or ML server offline.",
      detail: { code, message },
    };
  }
};

module.exports = { sendToML };
