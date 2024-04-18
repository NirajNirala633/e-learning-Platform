require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { getClient } = require("../config/db");
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Course Enrollment
const courseEnrollmentController = async (req, res) => {
  try {
    const client = await getClient();
    const { course_id } = req.body;

    const chechQuery =
      "SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2";

    const { rows } = await client.query(chechQuery, [req.user.user_id, course_id]);
    if (rows.length > 0) {
      return res.json({
        message: "User Already Enrolled in this course",
      });
    }

    const enrollmentQuery =
      "INSERT INTO enrollments (enrollment_id, user_id, course_id) VALUES ($1, $2, $3)";
    await client.query(enrollmentQuery, [
      uuidv4(),
      req.user.user_id,
      course_id
    ]);

     // Send enrollment notification email using Resend
     await resend.emails.send({
      from: 'notifications@example.com',
      to: req.user.email, // Assuming email is stored in the users table
      subject: 'Course Enrollment Notification',
      html: `<p>You have successfully enrolled in Course ${course_id}.</p>`,
    });


    res.json({ message: "Enrollment successful" });
    
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Course Enrollment API.",
      error,
    });
  }
};

// View Enrolled Course
const viewEnrolledCourseController = async (req, res) => {
  try {
    const client = await getClient();
    const query = "SELECT * FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE user_id = $1";
    const { rows } = await client.query(query, [req.user.user_id]);

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in View Enroll Course API.",
      error,
    });
  }
};

module.exports = { courseEnrollmentController, viewEnrolledCourseController };
