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

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("ML error:", error.message);
    res.status(500).json({
      success: false,
      message: "ML service error",
    });
  }
};

module.exports = { checkDrawing };