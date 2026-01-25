const axios = require("axios");

exports.getClusterPrediction = async (sessionData) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/predict", {
      typingSpeed: sessionData.typingSpeed,
      typedChars: sessionData.typedChars,
      backspaceCount: sessionData.backspaceCount,
      pasteCount: sessionData.pasteCount,
      avgPauseTime: sessionData.avgPauseTime,
      sessionTime: sessionData.sessionTime
    });

    return response.data.cluster;
  } catch (error) {
    console.error("ML Service Error:", error.message);
    return null; // fallback if ML fails
  }
};
