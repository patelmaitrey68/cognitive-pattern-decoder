// const Project = require("../models/Project.model");

// exports.createProject = async (req, res) => {
//   try {
//     const { name, type, userId } = req.body;

//     const project = new Project({
//       name,
//       type,
//       userId
//     });

//     await project.save();

//     res.status(201).json({
//       message: "Project created",
//       project
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create project" });
//   }
// };

// exports.getProjectsByUser = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const projects = await Project.find({ userId });

//     res.json(projects);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch projects" });
//   }
// };
const Project = require("../models/Project.model");

exports.createProject = async (req, res) => {
  try {
    const { name, type } = req.body;

    // Check if user is authenticated (should be handled by middleware)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const project = new Project({
      name,
      type,
      userId: req.user.userId // 🔐 From JWT
    });

    await project.save();

    res.status(201).json({
      message: "Project created",
      project
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

exports.getProjectsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await Project.find({ userId });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// ===============================
// PROJECT ACTIVITY
// ===============================
exports.getActivity = async (req, res) => {
  try {
    const { projectId } = req.params;

    const sessions = await Session.find({ projectId });
    const mlResults = await MLResult.find({ projectId });

    const sessionCount = sessions.length;

    const clusterCounts = {};
    mlResults.forEach(r => {
      clusterCounts[r.cluster] =
        (clusterCounts[r.cluster] || 0) + 1;
    });

    res.json({
      sessionCount,
      clusterCounts
    });

  } catch (error) {
    console.error("Project activity error:", error);
    res.status(500).json({
      error: "Failed to fetch project activity"
    });
  }
};