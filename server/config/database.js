const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create default admin if it doesn't exist
    const Admin = require("../models/Admin");
    const adminExists = await Admin.findOne({ email: "admin@admin.com" });

    if (!adminExists) {
      const defaultAdmin = new Admin({
        email: "admin@admin.com",
        password: "admin123",
      });
      await defaultAdmin.save();
      console.log("Default admin created: admin@admin.com / admin123");
    }
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
