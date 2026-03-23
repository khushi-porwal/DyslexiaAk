const axios = require("axios");

const sendToML = async (image, target) => {
  const mlUrl = process.env.ML_URL || "http://localhost:8000";
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
};

module.exports = { sendToML };