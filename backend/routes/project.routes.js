// const express = require("express");
// const router = express.Router();

// const {
//   createProject,
//   getProjectsByUser
// } = require("../controllers/project.controller");

// // Create project
// router.post("/", createProject);

// // Get projects of a user
// router.get("/user/:userId", getProjectsByUser);

// module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  createProject,
  getProjectsByUser
} = require("../controllers/project.controller");

// Create project
router.post("/", authMiddleware, createProject);

// Get projects of a user
router.get("/user/:userId", authMiddleware, getProjectsByUser);

module.exports = router;