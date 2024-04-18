const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { courseEnrollmentController, viewEnrolledCourseController } = require("../controllers/enrollmentController");
const router = express.Router();

router.use(verifyToken);

router.post("/enrollCourse", isAuthenticated, courseEnrollmentController);
router.get("/enrolledCourses", isAuthenticated, viewEnrolledCourseController);

module.exports = router;