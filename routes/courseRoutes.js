const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  createCourseController,
  getAllCourseController,
  getCourseByIdController,
  updateCourseByIdController,
  deleteCouseByIdController,
  filterController,
} = require("../controllers/courseController");
const isAuthor = require("../middlewares/isAuthor");
const router = express.Router();

router.use(verifyToken);

router.get("/getAllCourses", isAuthenticated, getAllCourseController);
router.get("/getCourse/:id", isAuthenticated, getCourseByIdController);
router.post("/createCourse", isAuthenticated, createCourseController);
router.put("/updateCourse/:id", isAuthenticated, isAuthor, updateCourseByIdController);
router.delete("/deleteCourse/:id", isAuthenticated, isAuthor, deleteCouseByIdController);
router.get("/filter", filterController);

module.exports = router;
