const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const signupHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const { name, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required including role" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res
      .status(201)
      .json({ message: "Signup successful", user: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Role validation
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res
        .status(401)
        .json({ message: "Incorrect role for this account" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
const profileHandler = async (req, res) => {
  try {
    console.log("req", req);
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const user = await User.findById(userId).populate("projects assignments");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching profile failed", error: error.message });
  }
};
const updateUserHandler = async (req, res) => {
  try { 
    const currentUser = req.user;
    const updates = req.body;

    // Engineers can only update their own profile
    if (currentUser.role !== "manager" && updates.role) {
      delete updates.role;
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser.userId,
      updates,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Updating user failed",
      error: error.message,
    });
  }
};
const deleteUserHandler = async (req, res) => {
  try {
    const currentUser = req.user;
    const userIdToDelete = req.params.id;

    // Only allow if manager or the user themself
    if (
      currentUser.role !== "manager" &&
      currentUser.userId !== userIdToDelete
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not authorized to delete this user" });
    }

    const deletedUser = await User.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Deleting user failed", error: error.message });
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  profileHandler,
  updateUserHandler,
  deleteUserHandler,
};
