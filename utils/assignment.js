const Assignment = require("../models/Assignment");
const User = require("../models/User");
const Project = require("../models/Project");

// const getAssignmentsHandler = async (req, res) => {
//   try {
//     const query =
//       req.user.role === "engineer" ? { engineerId: req.user.userId } : {};

//     const assignments = await Assignment.find(query)
//       .populate("engineerId", "name email maxCapacity department")
//       .populate("projectId", "name startDate endDate status");

//     res.status(200).json(assignments);
//   } catch (error) {
//     res.status(500).json({
//       message: "Fetching assignments failed",
//       error: error.message,
//     });
//   }
// };
const getAssignmentsHandler = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "engineer") {
      query = { engineerId: req.user.userId };
    } else if (req.user.role === "manager") {
      query = { createdBy: req.user.userId };
    }

    const assignments = await Assignment.find(query)
      .populate("engineerId", "name email maxCapacity department")
      .populate("projectId", "name startDate endDate status");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({
      message: "Fetching assignments failed",
      error: error.message,
    });
  }
};

const createAssignmentHandler = async (req, res) => {
  try {
    const {
      name,
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    } = req.body;

    const createdBy = req.user.userId;
    const engineer = await User.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({ message: "Engineer not found" });
    }

    // Validating project existence and get its dates
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const assignmentStart = new Date(startDate);
    const assignmentEnd = new Date(endDate);

    // Validating assignment dates are within project duration
    if (
      assignmentStart < projectStart ||
      assignmentEnd > projectEnd ||
      assignmentStart > assignmentEnd
    ) {
      return res.status(400).json({
        message: `Assignment dates must be within project duration (${projectStart.toDateString()} - ${projectEnd.toDateString()})`,
      });
    }

    // Check for overlapping assignments and validate allocation
    const overlappingAssignments = await Assignment.find({
      engineerId,
      $or: [
        {
          startDate: { $lte: assignmentEnd },
          endDate: { $gte: assignmentStart },
        },
      ],
    });

    const overlappingAllocation = overlappingAssignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    const maxCapacity = engineer.maxCapacity || 100;
    if (overlappingAllocation + allocationPercentage > maxCapacity) {
      return res.status(400).json({
        message: `Cannot assign. Exceeds capacity. Current overlapping allocation: ${overlappingAllocation}%, trying to add ${allocationPercentage}% (Max: ${maxCapacity}%)`,
      });
    }

    // Creating and saving the assignment
    const assignment = new Assignment({
      name,
      createdBy,
      engineerId,
      projectId,
      allocationPercentage,
      startDate: assignmentStart,
      endDate: assignmentEnd,
      role,
    });

    await assignment.save();
    engineer.assignments.push(assignment._id);
    await engineer.save();

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({
      message: "Creating assignment failed",
      error: error.message,
    });
  }
};

const updateAssignmentHandler = async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Assignment not found" });
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Updating assignment failed", error: error.message });
  }
};

const deleteAssignmentHandler = async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Assignment not found" });
    res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Deleting assignment failed", error: error.message });
  }
};

const getEngineerCapacities = async (req, res) => {
  try {
    const engineers = await User.find({ role: "engineer" });
    const assignments = await Assignment.find();

    const capacities = engineers.map((engineer) => {
      const assigned = assignments.filter(
        (a) => a.engineerId.toString() === engineer._id.toString()
      );

      const totalAllocation = assigned.reduce(
        (sum, a) => sum + a.allocationPercentage,
        0
      );

      return {
        engineerId: engineer._id,
        name: engineer.name,
        department: engineer.department,
        currentAllocation: totalAllocation,
        maxCapacity: engineer.maxCapacity,
        availableCapacity: Math.max(engineer.maxCapacity - totalAllocation, 0),
      };
    });

    res.status(200).json(capacities);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching capacities",
      error: error.message,
    });
  }
};

module.exports = {
  getAssignmentsHandler,
  createAssignmentHandler,
  updateAssignmentHandler,
  deleteAssignmentHandler,
  getEngineerCapacities,
};
