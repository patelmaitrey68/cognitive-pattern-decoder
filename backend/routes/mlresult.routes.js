const express = require("express");
const router = express.Router();

const {
  saveResult,
  getResultsByUser
} = require("../controllers/mlresult.controller");

// Save ML result
router.post("/", saveResult);

// Get ML results by user
router.get("/user/:userId", getResultsByUser);

module.exports = router;
