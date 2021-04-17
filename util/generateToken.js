const jwt = require("jsonwebtoken");

module.exports.generateToken = (user) => {
  const { id } = user;
  return jwt.sign(
    {
      id,
    },
    process.env.SECRET_KEY,
    { expiresIn: "12h" }
  );
};
