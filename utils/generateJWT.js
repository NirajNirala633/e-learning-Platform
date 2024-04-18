const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  const token = jwt.sign(
    {
      id: userId,
      role
    },
    process.env.JWT_SECRET || "OGebj_*^5?>{N+E=o"
  );
  return token;
};

module.exports = generateToken;
