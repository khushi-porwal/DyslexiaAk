const axios = require("axios");

const sendToML = async (image, target) => {
  const response = await axios.post(
    `${process.env.ML_URL}/predict`,
    { image, target }
  );
  return response.data;
};

module.exports = { sendToML };