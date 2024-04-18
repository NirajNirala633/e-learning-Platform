const { getClient } = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const client = await getClient();
    const result = await client.query(
      `SELECT author FROM courses WHERE id = $1`,
      [req.params.id]
    );
    // console.log(result);
    // console.log(result.rows[0].author.toString(), req.user.user_id.toString());
    if (result.rows.length > 0 && result.rows[0].author.toString() === req.user.user_id.toString()) {
      next();
    } else {
      return res.json({
        unauthorized: true,
        message: "You are not the owner of this course.",
      });
    }
  } catch (error) {
    console.error("Error executing query:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
