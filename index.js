const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { initializeDatabase } = require("./db/db");
const authorizeRoles = require("./middlewares/authorize");

const { signupHandler, loginHandler, profileHandler } = require("./utils/auth");

const {
  getProjectsHandler,
  getProjectByIdHandler,
  createProject,
} = require("./utils/project");

const {
  getAssignmentsHandler,
  createAssignmentHandler,
  updateAssignmentHandler,
  deleteAssignmentHandler,
  getEngineerCapacities,
} = require("./utils/assignment");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => res.send("Welcome to the Project Management API"));

// --- AUTH ROUTES ---
app.post("/api/auth/signup", signupHandler);
app.post("/api/auth/login", loginHandler);
app.get(
  "/api/auth/profile",
  authorizeRoles("engineer", "manager"),
  profileHandler
);

// --- ENGINEERS ---
app.get("/api/engineers", authorizeRoles("manager"), async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" });
    res.status(200).json(engineers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching engineers failed", error: error.message });
  }
});

app.get(
  "/api/engineers/:id/capacity",
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const engineer = await User.findById(req.params.id).populate(
        "assignments"
      );
      const available =
        100 -
        engineer.assignments.reduce(
          (acc, a) => acc + a.allocationPercentage,
          0
        );
      res.status(200).json({ name: engineer.name, available });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Fetching capacity failed", error: error.message });
    }
  }
);

// --- PROJECTS ---
app.get(
  "/api/projects",
  authorizeRoles("manager", "engineer"),
  getProjectsHandler
);
// assigning Project to engineer
app.post("/api/projects", authorizeRoles("manager"), createProject);
app.get(
  "/api/projects/:id",
  authorizeRoles("manager", "engineer"),
  getProjectByIdHandler
);
app.get("/api/projects", getProjectsHandler);

// --- ASSIGNMENTS ---
app.get(
  "/api/assignments",
  authorizeRoles("manager", "engineer"),
  getAssignmentsHandler
);
app.post(
  "/api/assignments",
  authorizeRoles("manager"),
  createAssignmentHandler
);
app.put(
  "/api/assignments/:id",
  authorizeRoles("manager"),
  updateAssignmentHandler
);
app.delete(
  "/api/assignments/:id",
  authorizeRoles("manager"),
  deleteAssignmentHandler
);

// engineer Capacity
app.get(
  "/api/engineers/capacity",
  authorizeRoles("manager"),
  getEngineerCapacities
);

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
