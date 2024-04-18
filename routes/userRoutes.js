const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  getUserController,
  updateUserController,
  resetPasswordController,
  deleteUserController,
} = require("../controllers/userController");
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.use(verifyToken);

// routes
// GET USER
router.get("/getUser", isAuthenticated, getUserController);

// UPDATE PROFILE
router.put("/updateUser", isAuthenticated, updateUserController);

// RESET PASSWORD
router.post("/resetPassword", isAuthenticated, resetPasswordController);

// DELETE USER PROFILE
router.delete("/deleteUser", isAuthenticated, deleteUserController);

module.exports = router;
