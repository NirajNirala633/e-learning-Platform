const express = require("express");
const {
  registerController,
  loginController,
} = require("../controllers/authController");

const router = express.Router();

// routes
// USER REGISTRATION || POST
router.post("/register", registerController);

// USER LOGIN
router.post("/login", loginController);

module.exports = router;
