const Project = require("../models/Project");

const getProjectsHandler = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching projects failed", error: error.message });
  }
};
const getProjectByIdHandler = async (req, res) => {
  try {
    // Only fetching projects created by the logged-in manager
    if (req.user.role === "manager") {
      const projects = await Project.find({ managerId: req.user.userId });
      return res.status(200).json(projects);
    }

    if (req.user.role === "engineer") {
      return res.status(403).json({ message: "Not implemented for engineers" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const currentUser = req.user;

    // Role check
    if (currentUser.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can create projects." });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
    } = req.body;
    // Validate required fields
    if (!name || !status) {
      return res
        .status(400)
        .json({ message: "Project name and status are required." });
    }

    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      requiredSkills,
      teamSize,
      status,
      managerId: currentUser.userId, 
    });

    await newProject.save();

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProjectsHandler,
  getProjectByIdHandler,
  createProject,
};
