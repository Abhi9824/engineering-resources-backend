const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.mongoDB;

const initializeDatabase = async () => {
  try {
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (connection) {
      console.log("Database connected successfully");
    }
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

module.exports = {
  initializeDatabase,
};
