const bcrypt = require("bcryptjs");
const User = require("./Models/User");
const main = require("./Config/db");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await main();

    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "admin123",
      10
    );

    const admin = await User.create({
      name: "Unified Campus Admin",
      email: "admin@smartcampus.com",
      password: hashedPassword,
      role: "admin",
      phone: "9999999999",
      isActive: true,
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password: admin123");

    process.exit(0);

  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
};

createAdmin();