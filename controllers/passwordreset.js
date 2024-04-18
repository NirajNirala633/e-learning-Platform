const { Resend } = require('resend');
const resend = new Resend('YOUR_RESEND_API_KEY');

const resetPasswordController = async (req, res) => {
  try {
    const client = await getClient();
    const { newPassword } = req.body;
    const user_id = req.user.user_id;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    const hashedPassword = hashPassword(newPassword);

    const updatePasswordQuery = {
      text: "UPDATE users SET password = $1 WHERE user_id = $2 RETURNING *",
      values: [hashedPassword, user_id],
    };

    const updatedUserResult = await client.query(updatePasswordQuery);
    const updatedUser = updatedUserResult.rows[0];

    // Send password reset email using Resend
    await resend.emails.send({
      from: 'noreply@example.com',
      to: updatedUser.email, // assuming email is stored in the users table
      subject: 'Password Reset Confirmation',
      html: '<p>Your password has been successfully reset.</p>',
    });

    res.status(200).json({ success: true, message: "Password reset successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Reset Password API",
      error,
    });
  }
};
