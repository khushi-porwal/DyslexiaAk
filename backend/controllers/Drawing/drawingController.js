const { sendToML } = require("../../services/Ml_Service/mlService");

const checkDrawing = async (req, res) => {
  try {
    const { image, target } = req.body;

    if (!image || !target) {
      return res.status(400).json({
        success: false,
        message: "Image and target are required",
      });
    }

    const result = await sendToML(image, target);

    // If ML returns low-confidence as success=false but includes a prediction, surface it
    if (result?.success === false && result.predicted) {
      return res.json({ ...result, success: true, lowConfidence: true });
    }

    return res.json(result);
  } catch (error) {
    const d = error.response?.data;
    const isNetwork =
      error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT";

    const mlMessage =
      (isNetwork ? "ML service unreachable" : null) ||
      d?.message ||
      (typeof d?.detail === "string" ? d.detail : null) ||
      (Array.isArray(d?.detail) && d.detail[0]?.msg ? d.detail[0].msg : null) ||
      error.message ||
      "ML service error";

    // Log full error so we can see real cause (e.g. in backend terminal)
    console.error("ML drawing error:", {
      code: error.code,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    res.status(500).json({
      success: false,
      message: mlMessage,
    });
  }
};

module.exports = { checkDrawing };
