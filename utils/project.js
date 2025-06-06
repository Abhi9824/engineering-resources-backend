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
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching project failed", error: error.message });
  }
};
const createProject = async (req, res) => {
  try {
    const currentUser = req.user;
    if (currentUser.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can create projects." });
    }

    const newProject = new Project({
      ...req.body,
      managerId: currentUser.userId,
    });

    await newProject.save();
    res.status(201).json(newProject);
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
