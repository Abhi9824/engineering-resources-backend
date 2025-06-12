const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  requiredSkills: [String],
  teamSize: Number,
  status: { type: String, enum: ["planning", "active", "completed"] },

  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  
  },
});

module.exports = mongoose.model("Project", projectSchema);
