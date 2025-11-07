var express = require("express");
var router = express.Router();
var userSchema = require("../models/Users.model");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.put("/:id/approve", async function (req, res, next) {
  const userId = req.params.id;
  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await userSchema.findByIdAndUpdate(userId, { approve: true });
    res.json({ message: "User approved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "ระบบเกิดข้อผิดพลาด", data: null });
  }
});

module.exports = router;
