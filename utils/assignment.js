const Assignment = require("../models/Assignment");
const User = require("../models/User");

const getAssignmentsHandler = async (req, res) => {
  try {
    const query =
      req.user.role === "engineer" ? { engineerId: req.user.userId } : {};

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
      engineerId,
      projectId,
      allocationPercentage,
      startDate,
      endDate,
      role,
    } = req.body;

    const engineer = await User.findById(engineerId);
    if (!engineer)
      return res.status(404).json({ message: "Engineer not found" });

    const assignments = await Assignment.find({ engineerId });

    const totalAllocated = assignments.reduce(
      (sum, a) => sum + a.allocationPercentage,
      0
    );

    const remainingCapacity = engineer.maxCapacity - totalAllocated;

    if (allocationPercentage > remainingCapacity) {
      return res.status(400).json({
        message: `Cannot assign. Only ${remainingCapacity}% capacity left.`,
      });
    }

    const assignment = new Assignment({
      engineerId,
      projectId,
      allocationPercentage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      role,
    });

    await assignment.save();
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

// const getEngineerCapacities = async (req, res) => {
//   try {
//     const engineers = await User.find({ role: "engineer" });
//     const assignments = await Assignment.find();

//     const capacities = engineers.map((engineer) => {
//       const assigned = assignments.filter(
//         (a) => a.engineerId.toString() === engineer._id.toString()
//       );

//       // Group by overlapping timelines and sum their allocations
//       let maxOverlapAllocation = 0;

//       for (let i = 0; i < assigned.length; i++) {
//         const current = assigned[i];
//         let overlapSum = current.allocationPercentage;

//         for (let j = 0; j < assigned.length; j++) {
//           if (i !== j) {
//             const other = assigned[j];
//             const isOverlapping =
//               new Date(current.startDate) <= new Date(other.endDate) &&
//               new Date(other.startDate) <= new Date(current.endDate);

//             if (isOverlapping) {
//               overlapSum += other.allocationPercentage;
//             }
//           }
//         }

//         if (overlapSum > maxOverlapAllocation) {
//           maxOverlapAllocation = overlapSum;
//         }
//       }

//       return {
//         engineerId: engineer._id,
//         name: engineer.name,
//         department: engineer.department,
//         currentAllocation: maxOverlapAllocation,
//         maxCapacity: engineer.maxCapacity,
//         availableCapacity: Math.max(
//           engineer.maxCapacity - maxOverlapAllocation,
//           0
//         ),
//       };
//     });

//     res.status(200).json(capacities);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching capacities", error: error.message });
//   }
// };
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

export const getAllAssignment=async()=>{
  try {
    const 
  } catch (error) {
    
  }
}

module.exports = {
  getAssignmentsHandler,
  createAssignmentHandler,
  updateAssignmentHandler,
  deleteAssignmentHandler,
  getEngineerCapacities,
};
