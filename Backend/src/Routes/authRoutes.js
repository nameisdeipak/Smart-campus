const express = require("express");
const authRoutes = express.Router();

const {
  login,
  getMe,logout
} = require("../Controllers/authController");

authRoutes.post("/login", login);
authRoutes.get("/me", getMe);
authRoutes.post("/logout", logout);


module.exports = authRoutes;