require("dotenv").config();
const { getClient } = require("../config/db");
const hashPassword = require("../utils/hashPassword");
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const getUserController = async (req, res) => {
  const client = await getClient();

  try {
    const query = {
      text: "SELECT * FROM users WHERE user_id = $1",
      values: [req.user.user_id]
    };

    const result = await client.query(query);

    const users = result.rows;
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Errro in Get User API.",
      error,
    });
  }
};

const updateUserController = async (req, res) => {
  try {
    const client = await getClient();
    const { user_id } = req.params; // Assuming user_id is passed as a parameter in the URL
    const { username, email, avatar, role } = req.body; // Assuming username, email, avatar, and role are sent in the request body

    // Check if user exists
    const userExistsQuery = {
      text: "SELECT * FROM users WHERE user_id = $1",
      values: [user_id],
    };

    const userExistsResult = await client.query(userExistsQuery);

    if (userExistsResult.rows.length === 0) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Update user information
    const updateUserQuery = {
      text: `
        UPDATE users
        SET username = $1, email = $2, avatar = $3, role = $4
        WHERE user_id = $5
        RETURNING *
      `,
      values: [username, email, avatar, role, user_id],
    };

    const updatedUserResult = await client.query(updateUserQuery);

    const updatedUser = updatedUserResult.rows[0];

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      message: "Error in Update User API.",
      error,
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const client = await getClient();
    
    const { newPassword } = req.body;
    
    const user_id = req.user.user_id;

    // Check if the newPassword is provided
    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }
    const hashedPassword = hashPassword(newPassword);

    // Update the user's password
    const updatePasswordQuery = {
      text: "UPDATE users SET password = $1 WHERE user_id = $2 RETURNING *",
      values: [hashedPassword, user_id],
    };

    const updatedUserResult = await client.query(updatePasswordQuery);

    const updatedUser = updatedUserResult.rows[0];

    // Send password reset email using Resend
    await resend.emails.send({
      from: 'noreply@example.com',
      to: req.user.email,
      subject: 'Password Reset Confirmation',
      html: '<p>Your password has been successfully reset.</p>',
    });

    res.status(200).json({ success: true, message: "Password reset successfully", user: updatedUser });

    // res.status(200).json({ success: true, message: "Password reset successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Reset Password API",
      error,
    });
  }
};

const deleteUserController = async (req, res) => {
  const client = await getClient();

  try {
    const { user_id } = req.params;

    // Check if there are any dependent records in the enrollments table
    const checkEnrollmentsQuery = {
      text: "SELECT * FROM enrollments WHERE user_id = $1",
      values: [user_id],
    };

    const checkEnrollmentsResult = await client.query(checkEnrollmentsQuery);

    if (checkEnrollmentsResult.rows.length > 0) {
      // If there are dependent records, delete them first
      const deleteEnrollmentsQuery = {
        text: "DELETE FROM enrollments WHERE user_id = $1",
        values: [user_id],
      };

      await client.query(deleteEnrollmentsQuery);
    }

    // Now delete the user
    const deleteUserQuery = {
      text: "DELETE FROM users WHERE user_id = $1 RETURNING *",
      values: [user_id],
    };

    const deletedUserResult = await client.query(deleteUserQuery);

    const deletedUser = deletedUserResult.rows[0];

    res.json({
      success: true,
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Delete User API",
      error,
    });
  }
};

module.exports = {
  getUserController,
  updateUserController,
  resetPasswordController,
  deleteUserController,
};
