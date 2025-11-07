const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  console.log("token", req.headers.authorization.split("Bearer ")[1]);
  const token = req.headers.authorization.split("Bearer ")[1];

  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, "jwtsecret");
    req.user = verified;
    return next();
  } catch (error) {
    console.log(error);

    res.status(400).send("Invalid Token");
  }
};
