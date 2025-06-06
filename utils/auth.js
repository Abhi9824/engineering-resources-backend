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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const profileHandler = async (req, res) => {
  try {
    console.log("Fetching profile for user:", req.user.userId);
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const user = await User.findById(req.user.userId).populate(
      "projects assignments"
    );
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching profile failed", error: error.message });
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  profileHandler,
};
