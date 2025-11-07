var express = require("express");
var router = express.Router();
var userSchema = require("../models/Users.model");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
require("dotenv").config();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/", async function (req, res, next) {

  const { email, password } = req.body;
  try {
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: " อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    if (user.approve === true) {
      let token = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
          approve: user.approve,
          role: user.role,
        },
        "jwtsecret",
        { expiresIn: "2h" }
      );
      res
        .status(200)
        .json({
          status: 200,
          message: "Login successful",
          Accresstoken: token,
        });
    } else {
      return res
        .status(401)
        .json({ status: 401, message: "คุณยังไม่่ได้ถูกอนุมัติ" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "ระบบเกิดข้อผิดพลาด" });
  }
  
});

module.exports = router;
