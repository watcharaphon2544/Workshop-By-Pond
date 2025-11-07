var express = require("express");
var router = express.Router();
var userSchema = require("../models/Users.model");
var bcrypt = require("bcrypt");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/", async function (req, res, next) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userSchema({
      name,
      email,
      password: hashedPassword,
      role: 0,
      approve: false,
    });
    await user.save();
    res
      .status(201)
      .json({ status: 200, message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "ระบบเกิดข้อผิดพลาด" });
  }
});
module.exports = router;
