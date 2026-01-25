const MLResult = require("../models/MLResult.model");

exports.saveResult = async (req, res) => {
  try {
    const result = new MLResult(req.body);
    await result.save();

    res.status(201).json({
      message: "ML result saved"
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to save ML result"
    });
  }
};

exports.getResultsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await MLResult.find({ userId });

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch ML results"
    });
  }
};
