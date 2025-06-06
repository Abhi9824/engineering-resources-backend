const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["engineer", "manager"],
    required: true,
    set: (v) => v.toLowerCase(),
  },

  // Only applicable if role is 'engineer' (handle conditionally in logic)
  skills: [String],
  seniority: {
    type: String,
    enum: ["junior", "mid", "senior"],
    set: (v) => v.toLowerCase(),
  },
  maxCapacity: Number,
  department: String,

  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
