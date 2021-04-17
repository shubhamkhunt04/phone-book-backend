const jwt = require("jsonwebtoken");

module.exports.verifyUser = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader) {
    const token = req.headers.authorization.split("Bearer ")[1];
    const options = {
      expiresIn: "2d",
    };

    try {
      const user = jwt.verify(token, process.env.SECRET_KEY, options);
      req.decoded = user;
      next();
    } catch (error) {
      return res.json({
        message: "You are not authorize",
      });
    }
  } else {
    result = {
      message: `Authentication error. Token required.`,
    };
    return res.json(result);
  }
};
