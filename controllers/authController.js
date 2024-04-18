require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { Resend } = require('resend');
const hashPassword = require("../utils/hashPassword");
const { getClient } = require("../config/db");
const generateToken = require("../utils/generateJWT");

const resend = new Resend(process.env.RESEND_API_KEY);


// REGISTER
const registerController = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const client = await getClient();
  
    if (!username || !email || !password) {
      return res.json({
        success: false,
        message: "Required Fields",
      });
    }

    const user = await client.query(
      `SELECT * FROM users WHERE email = '${email}';`
    );
    if (user.rows[0]) {
      return res.json({
        success: false,
        message: "User Already exists!",
      });
    }
    const hashedPassword = hashPassword(password);
    const avatar = req.body.avatar || "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.rawpixel.com%2Fsearch%2Fprofile%2520icon&psig=AOvVaw0IHdq2Ie1uKozZd0LRzJxT&ust=1712168191630000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLip2tqRpIUDFQAAAAAdAAAAABAE";
    const userRole = role || 'user';

    const { rows } = await client.query(
      `INSERT INTO users(user_id, username, email, password, avatar, role) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), username, email, hashedPassword, avatar, userRole]
    );
    

    // Send confirmation email using Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Registration Confirmation',
      html: `<p>Hi ${username},</p><p>Thank you for registering with us!</p>`
    });

    res.json({
      success: true,
      data: {
        registered: true,
        message: "User registered successfully. Confirmation email sent.",
        token: generateToken(rows[0].user_id.toString(), role),
      },
    });
    // res.json({
    //   success: true,
    //   data: {
    //     registered: true,
    //     message: "User registered successfully.",
    //     token: generateToken(rows[0].user_id.toString(), role),
    //   },
    // });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Register API.",
      error: error,
    });
  }
};

// LOGIN
const loginController = async (req, res) => {
  try {
    const client = await getClient();

    const { email, password, role } = req.body;
    let user = null;

    if (email) {
      user = await client.query(
        `SELECT * FROM users where email = '${email}';`
      );
      if (!user.rows[0]) {
        return res.json({
          message: "Email Doesn't Exist",
        });
      }
    }
    // console.log(user.rows[0].password, password);
    // console.log(user.rows[0].password === hashPassword(password));
    if (user.rows[0].password !== hashPassword(password)) {
      return res.json({
        message: "Incorrect Password",
      });
    }
    res.json({
      success: true,
      data: {
        login: true,
        message: "User logged in successfully.",
        token: generateToken(user.rows[0].user_id.toString(), role),
      },
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Login API.",
      error: error,
    });
  }
};

module.exports = { registerController, loginController };
